const { prisma } = require('../config/db');
const { createInvestmentCheckoutSession } = require('./stripe.controller');

const createInvestment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { projectId, amountInvested } = req.body;
        const parsedAmount = Number(amountInvested);

        if (!projectId || amountInvested === undefined || amountInvested === null) {
            return res.status(400).json({ error: 'Project ID and amount are required' });
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Investment amount must be a valid positive number' });
        }

        const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
        const currency = (settings?.currency || 'USD').toUpperCase();

        const { investment, payment, projectRecord } = await prisma.$transaction(async (tx) => {
            const projectRecord = await tx.project.findUnique({ where: { id: projectId } });
            if (!projectRecord) {
                throw new Error('PROJECT_NOT_FOUND');
            }

            if (projectRecord.status !== 'open') {
                throw new Error('PROJECT_NOT_OPEN');
            }

            if (new Date(projectRecord.fundingDeadline) < new Date()) {
                throw new Error('FUNDING_DEADLINE_PASSED');
            }

            if (parsedAmount < projectRecord.minInvestment) {
                throw new Error(`MIN_INVESTMENT:${projectRecord.minInvestment}`);
            }

            const remainingFunding = projectRecord.totalFunding - projectRecord.currentFunding;
            if (parsedAmount > remainingFunding) {
                throw new Error(`EXCEEDS_REMAINING:${remainingFunding}`);
            }

            const createdInvestment = await tx.investment.create({
                data: {
                    userId,
                    projectId,
                    amountInvested: parsedAmount,
                    currentValue: null,
                    status: 'pending',
                },
            });

            const createdPayment = await tx.payment.create({
                data: {
                    userId,
                    investmentId: createdInvestment.id,
                    projectId,
                    provider: 'STRIPE',
                    status: 'pending',
                    amount: parsedAmount,
                    currency,
                },
            });

            return {
                investment: createdInvestment,
                payment: createdPayment,
                projectRecord,
            };
        });

        const checkoutSession = await createInvestmentCheckoutSession({
            userId,
            projectId,
            investmentId: investment.id,
            paymentId: payment.id,
            amount: parsedAmount,
            currency,
            projectTitle: projectRecord.title,
        });

        await prisma.payment.update({
            where: { id: payment.id },
            data: { stripeCheckoutSessionId: checkoutSession.id },
        });

        res.status(201).json({
            message: 'Payment initiated successfully',
            checkoutUrl: checkoutSession.url,
            investmentId: investment.id,
            paymentId: payment.id,
        });
    } catch (error) {
        if (error.message === 'PROJECT_NOT_FOUND') {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (error.message === 'PROJECT_NOT_OPEN') {
            return res.status(400).json({ error: 'Project is not open for investment' });
        }

        if (error.message === 'FUNDING_DEADLINE_PASSED') {
            return res.status(400).json({ error: 'Funding deadline has passed for this project' });
        }

        if (error.message.startsWith('MIN_INVESTMENT:')) {
            const minInvestment = error.message.split(':')[1];
            return res.status(400).json({ error: `Minimum investment is ${minInvestment}` });
        }

        if (error.message.startsWith('EXCEEDS_REMAINING:')) {
            const remaining = Number(error.message.split(':')[1] || 0);
            return res.status(400).json({
                error: remaining > 0
                    ? `Amount exceeds remaining funding. Maximum allowed is ${remaining}`
                    : 'This project is fully funded',
            });
        }

        if (error.message && error.message.includes('Stripe is not configured')) {
            return res.status(500).json({ error: error.message });
        }

        console.error('Error creating investment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserInvestments = async (req, res) => {
    try {
        const userId = req.user.id;
        const investments = await prisma.investment.findMany({
            where: { userId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        category: true,
                        totalFunding: true,
                        currentFunding: true,
                        projectedROI: true,
                        payoutFrequency: true,
                        status: true,
                        fundingDeadline: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: { investmentDate: 'desc' },
        });

        res.status(200).json({ investments });
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllInvestments = async (req, res) => {
    try {
        const investments = await prisma.investment.findMany({
            include: { 
                user: { select: { name: true, email: true } }, 
                project: { select: { title: true } } 
            }
        });

        res.status(200).json({ investments });
    } catch (error) {
        console.error('Error fetching all investments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createInvestment,
    getUserInvestments,
    getAllInvestments,
};