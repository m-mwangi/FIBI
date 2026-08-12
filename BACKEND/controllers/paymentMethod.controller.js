const { prisma } = require('../config/db');

const getAvailablePaymentMethods = async (_req, res) => {
    // Currently only Stripe card payments exist in this implementation.
    res.status(200).json({
        methods: [
            { provider: 'STRIPE', methodType: 'card', label: 'Card' },
        ],
    });
};

const getUserPaymentMethods = async (req, res) => {
    try {
        const methods = await prisma.paymentMethod.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ methods });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAvailablePaymentMethods,
    getUserPaymentMethods,
};

