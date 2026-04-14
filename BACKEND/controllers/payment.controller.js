const { prisma } = require('../config/db');

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

module.exports = { getUserPayments };

