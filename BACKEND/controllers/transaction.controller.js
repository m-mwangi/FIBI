const { prisma } = require('../config/db');

/** Prisma enum values — manual API may only create deposit / withdrawal. */
const MANUAL_TYPES = new Set(['DEPOSIT', 'WITHDRAWAL']);

function normalizeTransactionType(type) {
    if (type === undefined || type === null) return null;
    const upper = String(type).trim().toUpperCase();
    return upper || null;
}

const createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, type } = req.body;

        const normalizedType = normalizeTransactionType(type);
        if (!normalizedType || !MANUAL_TYPES.has(normalizedType)) {
            return res.status(400).json({
                error: 'Type must be DEPOSIT or WITHDRAWAL',
            });
        }

        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        const globalSettings = await prisma.settings.findUnique({ where: { id: 'global' } });
        if (normalizedType === 'DEPOSIT' && globalSettings && !globalSettings.depositsEnabled) {
            return res.status(403).json({ error: 'Deposits are currently disabled' });
        }
        if (normalizedType === 'WITHDRAWAL' && globalSettings && !globalSettings.withdrawalsEnabled) {
            return res.status(403).json({ error: 'Withdrawals are currently disabled' });
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId,
                amount: parsedAmount,
                type: normalizedType,
                status: 'completed',
            },
        });

        res.status(201).json({ message: 'Transaction created successfully', transaction });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createTransaction, getUserTransactions, getAllTransactions };
