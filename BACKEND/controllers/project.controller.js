const { prisma } = require('../config/db');
const { buildStoredImagePath } = require("../utils/project-image-url.util");
const { recordAudit, changedFields } = require('../utils/audit');

const parseArrayInput = (input) => {
    if (Array.isArray(input)) return input;
    if (!input) return [];

    if (typeof input === "string") {
        try {
            const parsed = JSON.parse(input);
            return Array.isArray(parsed) ? parsed : [];
        } catch (_error) {
            return input
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }

    return [];
};

const parseNumberField = (value) => {
    if (value === null || value === undefined || value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const dedupeStrings = (values) => [...new Set(values.filter(Boolean))];

const getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: { timeline: true, projectImages: true }
        });
        res.status(200).json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: { timeline: true, projectImages: true }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ project });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createProject = async (req, res) => {
    try {
        const {
            title,
            location,
            category,
            minInvestment,
            totalFunding,
            currentFunding,
            investorsCount,
            projectedROI,
            payoutFrequency,
            fundingDeadline,
            description,
            features,
            imageUrl,
            images,
            status,
            timeline
        } = req.body;

        const primaryUpload = req.files?.image?.[0];
        const additionalUploads = req.files?.images || [];
        const existingImages = parseArrayInput(images);

        const uploadedPrimaryPath = primaryUpload ? buildStoredImagePath(primaryUpload.filename) : null;
        const uploadedExtraPaths = additionalUploads
            .map((file) => buildStoredImagePath(file.filename))
            .filter(Boolean);

        const parsedTimeline = parseArrayInput(timeline);
        const parsedFeatures = parseArrayInput(features);
        const finalPrimaryImage = uploadedPrimaryPath || imageUrl;
        const allImages = dedupeStrings([
            ...(finalPrimaryImage ? [finalPrimaryImage] : []),
            ...uploadedExtraPaths,
            ...existingImages
        ]);

        if (!finalPrimaryImage) {
            return res.status(400).json({ error: "A primary project image is required (field: image)." });
        }

        const mappedTimeline = parsedTimeline.map(t => ({
            ...t,
            status: t.status === 'in-progress' ? 'in_progress' : t.status
        }));

        const project = await prisma.project.create({
            data: {
                title,
                location,
                category,
                minInvestment: parseNumberField(minInvestment),
                totalFunding: parseNumberField(totalFunding),
                currentFunding: parseNumberField(currentFunding) ?? 0,
                investorsCount: parseNumberField(investorsCount) ?? 0,
                projectedROI: parseNumberField(projectedROI),
                payoutFrequency,
                fundingDeadline: new Date(fundingDeadline),
                description,
                features: parsedFeatures,
                imageUrl: finalPrimaryImage,
                status: status || 'open',
                timeline: {
                    create: mappedTimeline
                },
                projectImages: {
                    create: allImages.map((url) => ({ imageUrl: url })),
                },
            },
            include: { timeline: true, projectImages: true }
        });

        recordAudit(req, {
            action: 'project.create',
            targetType: 'project',
            targetId: project.id,
            targetLabel: project.title,
            metadata: {
                category: project.category,
                totalFunding: project.totalFunding,
                status: project.status,
            },
        });

        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const primaryUpload = req.files?.image?.[0];
        const additionalUploads = req.files?.images || [];

        if (updates.fundingDeadline) {
             updates.fundingDeadline = new Date(updates.fundingDeadline);
        }

        if (updates.features) {
            updates.features = parseArrayInput(updates.features);
        }

        const bodyImages = parseArrayInput(updates.images);
        delete updates.images;

        const numericKeys = ["minInvestment", "totalFunding", "projectedROI", "currentFunding", "investorsCount"];
        numericKeys.forEach((key) => {
            if (updates[key] !== undefined) {
                const parsed = parseNumberField(updates[key]);
                if (parsed !== undefined) {
                    updates[key] = parsed;
                } else {
                    delete updates[key];
                }
            }
        });

        if (primaryUpload || additionalUploads.length > 0) {
            const existingProject = await prisma.project.findUnique({
                where: { id },
                select: { imageUrl: true }
            });

            if (!existingProject) {
                return res.status(404).json({ error: "Project not found" });
            }

            const uploadedPrimaryPath = primaryUpload
                ? buildStoredImagePath(primaryUpload.filename)
                : existingProject.imageUrl;

            const uploadedExtraPaths = additionalUploads
                .map((file) => buildStoredImagePath(file.filename))
                .filter(Boolean);

            updates.imageUrl = uploadedPrimaryPath;
        }

        const allExtraImages = [...bodyImages];
        additionalUploads.forEach((file) => {
            const storedPath = buildStoredImagePath(file.filename);
            if (storedPath) allExtraImages.push(storedPath);
        });
        if (updates.imageUrl) {
            allExtraImages.push(updates.imageUrl);
        }

        delete updates.timeline;

        // Snapshot the scalar fields before writing so the audit entry can name
        // what actually changed instead of restating the whole form.
        const before = await prisma.project.findUnique({
            where: { id },
            select: {
                title: true, location: true, category: true, minInvestment: true,
                totalFunding: true, currentFunding: true, investorsCount: true,
                projectedROI: true, payoutFrequency: true, status: true,
            }
        });

        const project = await prisma.project.update({
            where: { id },
            data: updates,
            include: { timeline: true, projectImages: true }
        });

        const imageRows = dedupeStrings(allExtraImages);
        if (imageRows.length > 0) {
            await prisma.projectImage.createMany({
                data: imageRows.map((url) => ({
                    projectId: id,
                    imageUrl: url,
                })),
            });
        }

        const updatedProject = await prisma.project.findUnique({
            where: { id },
            include: { timeline: true, projectImages: true }
        });

        const changes = before
            ? changedFields(before, {
                  title: project.title, location: project.location, category: project.category,
                  minInvestment: project.minInvestment, totalFunding: project.totalFunding,
                  currentFunding: project.currentFunding, investorsCount: project.investorsCount,
                  projectedROI: project.projectedROI, payoutFrequency: project.payoutFrequency,
                  status: project.status,
              })
            : null;

        recordAudit(req, {
            action: 'project.update',
            targetType: 'project',
            targetId: project.id,
            targetLabel: project.title,
            metadata: {
                changes,
                imagesAdded: imageRows.length || undefined,
            },
        });

        res.status(200).json({ message: 'Project updated successfully', project: updatedProject || project });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Capture the title before the row disappears — see deleteUser.
        const target = await prisma.project.findUnique({
            where: { id },
            select: { id: true, title: true, category: true, currentFunding: true }
        });

        await prisma.project.delete({ where: { id } });

        if (target) {
            recordAudit(req, {
                action: 'project.delete',
                targetType: 'project',
                targetId: target.id,
                targetLabel: target.title,
                metadata: { category: target.category, currentFunding: target.currentFunding },
            });
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };