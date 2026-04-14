const { prisma } = require('../config/db');

const getPaymentResponses = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            select: { userId: true },
        });

        if (!payment || payment.userId !== req.user.id) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const responses = await prisma.paymentResponse.findMany({
            where: { paymentId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        res.status(200).json({ responses });
    } catch (error) {
        console.error('Error fetching payment responses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getPaymentResponses };

