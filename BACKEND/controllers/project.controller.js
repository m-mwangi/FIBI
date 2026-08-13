const { prisma } = require('../config/db');
const { buildStoredImagePath } = require("../utils/project-image-url.util");
const { recordAudit, changedFields } = require('../utils/audit');
const { normaliseCurrency } = require('../utils/money');

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

/**
 * Parse an integer minor-unit field from a request.
 *
 * Multipart form fields arrive as strings, so this accepts strings, numbers and
 * BigInts. A fractional value is rejected rather than truncated: it means the
 * caller sent major units (500.50) where minor units were expected, and
 * silently keeping "500" would understate the amount by a factor of 100.
 */
const parseMinorField = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'bigint') return value;

    const text = String(value).trim();
    if (!/^-?\d+$/.test(text)) {
        throw new Error(`INVALID_MINOR_AMOUNT:${text}`);
    }
    return BigInt(text);
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
            minInvestmentMinor,
            totalFundingMinor,
            currentFundingMinor,
            currency,
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
                minInvestmentMinor: parseMinorField(minInvestmentMinor) ?? 0n,
                totalFundingMinor: parseMinorField(totalFundingMinor) ?? 0n,
                currentFundingMinor: parseMinorField(currentFundingMinor) ?? 0n,
                currency: normaliseCurrency(currency || 'USD'),
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
                totalFundingMinor: String(project.totalFundingMinor),
                currency: project.currency,
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

        // Money fields are BigInt minor units; the rest stay plain numbers.
        const minorKeys = ["minInvestmentMinor", "totalFundingMinor", "currentFundingMinor"];
        minorKeys.forEach((key) => {
            if (updates[key] !== undefined) {
                const parsed = parseMinorField(updates[key]);
                if (parsed !== undefined) updates[key] = parsed;
                else delete updates[key];
            }
        });

        const numericKeys = ["projectedROI", "investorsCount"];
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

        if (updates.currency !== undefined) {
            updates.currency = normaliseCurrency(updates.currency);
        }

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
                title: true, location: true, category: true, minInvestmentMinor: true,
                totalFundingMinor: true, currentFundingMinor: true, currency: true, investorsCount: true,
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
                  minInvestmentMinor: project.minInvestmentMinor, totalFundingMinor: project.totalFundingMinor,
                  currentFundingMinor: project.currentFundingMinor, currency: project.currency,
                  investorsCount: project.investorsCount,
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
            select: { id: true, title: true, category: true, currentFundingMinor: true, currency: true }
        });

        await prisma.project.delete({ where: { id } });

        if (target) {
            recordAudit(req, {
                action: 'project.delete',
                targetType: 'project',
                targetId: target.id,
                targetLabel: target.title,
                metadata: {
                    category: target.category,
                    currentFundingMinor: String(target.currentFundingMinor),
                    currency: target.currency,
                },
            });
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };