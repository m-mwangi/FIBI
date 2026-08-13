const { prisma } = require('../config/db');
const { getAdapter, usableProviders } = require('../payments');
const { money, format } = require('../utils/money');

const createInvestment = async (req, res) => {
    // Hoisted so the catch block can format minor-unit amounts carried out of
    // the transaction on error messages.
    let currency = 'USD';

    try {
        const userId = req.user.id;
        // Amount arrives as integer MINOR units (cents). The `Minor` suffix is
        // load-bearing: a client still posting major-unit `amountInvested` gets
        // a 400 rather than an investment 100x too small.
        // `provider` selects the rail. Defaults to Stripe so existing clients
        // keep working unchanged.
        const { projectId, amountInvestedMinor, provider = 'STRIPE' } = req.body;

        if (!projectId || amountInvestedMinor === undefined || amountInvestedMinor === null) {
            return res.status(400).json({ error: 'Project ID and amountInvestedMinor are required' });
        }

        const parsedAmount = Number(amountInvestedMinor);
        if (!Number.isSafeInteger(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                error: 'amountInvestedMinor must be a positive integer in minor units (cents)',
            });
        }

        const available = usableProviders();
        if (!available.includes(provider)) {
            return res.status(400).json({
                error: `Unsupported payment provider "${provider}". Available: ${available.join(', ')}`,
            });
        }

        const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
        currency = (settings?.currency || 'USD').toUpperCase();
        const amount = money(BigInt(parsedAmount), currency);

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

            // An investment must be in the project's currency; mixing them is a
            // bug, not something to paper over with an implicit conversion.
            if (projectRecord.currency !== currency) {
                throw new Error(`CURRENCY_MISMATCH:${projectRecord.currency}`);
            }

            // BigInt comparisons throughout — no float enters the funding maths.
            if (amount.amount < projectRecord.minInvestmentMinor) {
                throw new Error(`MIN_INVESTMENT:${projectRecord.minInvestmentMinor}`);
            }

            const remainingFunding = projectRecord.totalFundingMinor - projectRecord.currentFundingMinor;
            if (amount.amount > remainingFunding) {
                throw new Error(`EXCEEDS_REMAINING:${remainingFunding}`);
            }

            const createdInvestment = await tx.investment.create({
                data: {
                    userId,
                    projectId,
                    amountInvestedMinor: amount.amount,
                    currentValueMinor: null,
                    currency,
                    status: 'pending',
                },
            });

            const createdPayment = await tx.payment.create({
                data: {
                    userId,
                    investmentId: createdInvestment.id,
                    projectId,
                    provider,
                    status: 'pending',
                    amountMinor: amount.amount,
                    currency,
                },
            });

            return {
                investment: createdInvestment,
                payment: createdPayment,
                projectRecord,
            };
        });

        // The controller no longer knows what a Stripe session is. It asks the
        // adapter to initiate and records whatever handle comes back.
        const adapter = getAdapter(provider);
        const result = await adapter.initiate({
            payment,
            projectTitle: projectRecord.title,
        });

        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                providerRef: result.providerRef || null,
                providerMeta: result.providerMeta || undefined,
                status: result.status || 'pending',
            },
        });

        res.status(201).json({
            message: 'Payment initiated successfully',
            provider,
            status: result.status || 'pending',
            // `nextAction` tells the client what to do: redirect for a card,
            // display bank instructions for a wire.
            nextAction: result.nextAction,
            // Retained so existing clients that only understand a redirect keep
            // working without a coordinated frontend release.
            checkoutUrl: result.nextAction?.type === 'redirect' ? result.nextAction.url : undefined,
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

        if (error.message.startsWith('CURRENCY_MISMATCH:')) {
            const projectCurrency = error.message.split(':')[1];
            return res.status(400).json({
                error: `This project is denominated in ${projectCurrency}. Investments in another currency are not supported.`,
            });
        }

        // These carry minor units across the throw. Format them back to major
        // units for display — a user told "Minimum investment is 50000" when the
        // real minimum is $500 would reasonably give up.
        if (error.message.startsWith('MIN_INVESTMENT:')) {
            const minimum = money(BigInt(error.message.split(':')[1] || '0'), currency);
            return res.status(400).json({ error: `Minimum investment is ${format(minimum)}` });
        }

        if (error.message.startsWith('EXCEEDS_REMAINING:')) {
            const remaining = money(BigInt(error.message.split(':')[1] || '0'), currency);
            return res.status(400).json({
                error: remaining.amount > 0n
                    ? `Amount exceeds remaining funding. Maximum allowed is ${format(remaining)}`
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
                        totalFundingMinor: true,
                        currentFundingMinor: true,
                        currency: true,
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