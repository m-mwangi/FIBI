const { prisma } = require('../config/db');
const { usableProviders } = require('../payments');
const { findCollectionAccount } = require('../payments/manualWire.adapter');

/**
 * GET /api/v1/payments/methods
 *
 * Which rails an investor can actually use right now, for the platform's
 * currency. "Registered" is not the same as "usable": Stripe with no API key
 * and bank transfer with no collection account are both unavailable, and the
 * UI should not offer a button that is guaranteed to fail.
 */
const getAvailablePaymentMethods = async (req, res, next) => {
    try {
        const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
        const currency = (settings?.currency || 'USD').toUpperCase();

        const registered = usableProviders();
        const methods = [];

        if (registered.includes('STRIPE')) {
            methods.push({
                provider: 'STRIPE',
                label: 'Card payment',
                description: 'Pay instantly by debit or credit card.',
                settlement: 'instant',
            });
        }

        if (registered.includes('MANUAL_WIRE')) {
            // Only offered when there is an account to actually send money to.
            const account = await findCollectionAccount(currency);
            if (account) {
                methods.push({
                    provider: 'MANUAL_WIRE',
                    label: 'Bank transfer',
                    description: `Transfer from your bank to our ${account.bankName} account.`,
                    settlement: 'delayed',
                    bankName: account.bankName,
                });
            }
        }

        res.status(200).json({ success: true, currency, methods });
    } catch (error) {
        next(error);
    }
};

const getUserPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                investment: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                            },
                        },
                    },
                },
                paymentMethod: true,
                responses: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });

        res.status(200).json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getUserPayments, getAvailablePaymentMethods };

