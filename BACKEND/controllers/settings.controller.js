const { prisma } = require('../config/db');
const { recordAudit, changedFields } = require('../utils/audit');

const GLOBAL_ID = 'global';

/** Fields clients may change via PUT (never `id` or `updatedAt`). */
const PATCHABLE = new Set([
    'platformName',
    'supportEmail',
    'contactPhone',
    'minInvestment',
    'maxInvestment',
    'platformFee',
    'currency',
    'depositsEnabled',
    'withdrawalsEnabled',
    'transactionFee',
    'emailNotifications',
    'investmentEmails',
    'adminAlerts',
    'twoFactorAuth',
    'sessionTimeout',
]);

function coerceString(v, { maxLen = 500 } = {}) {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    if (s.length === 0) return undefined;
    return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function coerceFloat(v) {
    if (v === undefined || v === null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

function coerceInt(v) {
    if (v === undefined || v === null || v === '') return undefined;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : undefined;
}

function coerceBool(v) {
    if (v === undefined || v === null) return undefined;
    if (typeof v === 'boolean') return v;
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
    return undefined;
}

/**
 * Build Prisma `data` from req.body; only whitelisted keys.
 * @returns {{ data: Record<string, unknown>, error: string | null }}
 */
function buildUpdateData(body) {
    if (!body || typeof body !== 'object') {
        return { data: {}, error: null };
    }

    const data = {};

    const platformName = coerceString(body.platformName, { maxLen: 200 });
    if (platformName !== undefined) data.platformName = platformName;

    const supportEmail = coerceString(body.supportEmail, { maxLen: 320 });
    if (supportEmail !== undefined) data.supportEmail = supportEmail;

    const contactPhone = coerceString(body.contactPhone, { maxLen: 80 });
    if (contactPhone !== undefined) data.contactPhone = contactPhone;

    const currency = coerceString(body.currency, { maxLen: 10 });
    if (currency !== undefined) data.currency = currency.toUpperCase();

    const minInvestment = coerceFloat(body.minInvestment);
    if (minInvestment !== undefined) {
        if (minInvestment <= 0) return { data: {}, error: 'minInvestment must be positive' };
        data.minInvestment = minInvestment;
    }

    const maxInvestment = coerceFloat(body.maxInvestment);
    if (maxInvestment !== undefined) {
        if (maxInvestment <= 0) return { data: {}, error: 'maxInvestment must be positive' };
        data.maxInvestment = maxInvestment;
    }

    const platformFee = coerceFloat(body.platformFee);
    if (platformFee !== undefined) {
        if (platformFee < 0 || platformFee > 100) {
            return { data: {}, error: 'platformFee must be between 0 and 100' };
        }
        data.platformFee = platformFee;
    }

    const transactionFee = coerceFloat(body.transactionFee);
    if (transactionFee !== undefined) {
        if (transactionFee < 0 || transactionFee > 100) {
            return { data: {}, error: 'transactionFee must be between 0 and 100' };
        }
        data.transactionFee = transactionFee;
    }

    const depositsEnabled = coerceBool(body.depositsEnabled);
    if (depositsEnabled !== undefined) data.depositsEnabled = depositsEnabled;

    const withdrawalsEnabled = coerceBool(body.withdrawalsEnabled);
    if (withdrawalsEnabled !== undefined) data.withdrawalsEnabled = withdrawalsEnabled;

    const emailNotifications = coerceBool(body.emailNotifications);
    if (emailNotifications !== undefined) data.emailNotifications = emailNotifications;

    const investmentEmails = coerceBool(body.investmentEmails);
    if (investmentEmails !== undefined) data.investmentEmails = investmentEmails;

    const adminAlerts = coerceBool(body.adminAlerts);
    if (adminAlerts !== undefined) data.adminAlerts = adminAlerts;

    const twoFactorAuth = coerceBool(body.twoFactorAuth);
    if (twoFactorAuth !== undefined) data.twoFactorAuth = twoFactorAuth;

    const sessionTimeout = coerceInt(body.sessionTimeout);
    if (sessionTimeout !== undefined) {
        if (sessionTimeout < 5 || sessionTimeout > 10080) {
            return { data: {}, error: 'sessionTimeout must be between 5 and 10080 minutes' };
        }
        data.sessionTimeout = sessionTimeout;
    }

    // Drop any key not in schema (defensive)
    const safe = {};
    for (const key of Object.keys(data)) {
        if (PATCHABLE.has(key)) safe[key] = data[key];
    }

    return { data: safe, error: null };
}

const getPublicSettings = async (req, res) => {
    try {
        let settings = await prisma.settings.findUnique({ where: { id: GLOBAL_ID } });
        if (!settings) {
            settings = await prisma.settings.create({ data: { id: GLOBAL_ID } });
        }
        res.status(200).json({
            platformName: settings.platformName,
            supportEmail: settings.supportEmail,
            contactPhone: settings.contactPhone,
        });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSettings = async (req, res) => {
    try {
        let settings = await prisma.settings.findUnique({ where: { id: GLOBAL_ID } });
        if (!settings) {
            settings = await prisma.settings.create({ data: { id: GLOBAL_ID } });
        }
        res.status(200).json({ settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const { data, error } = buildUpdateData(req.body);
        if (error) {
            return res.status(400).json({ error });
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const existing = await prisma.settings.findUnique({ where: { id: GLOBAL_ID } });
        const base = existing || {
            minInvestment: 100,
            maxInvestment: 50000,
        };

        const nextMin = data.minInvestment !== undefined ? data.minInvestment : base.minInvestment;
        const nextMax = data.maxInvestment !== undefined ? data.maxInvestment : base.maxInvestment;
        if (nextMax < nextMin) {
            return res.status(400).json({ error: 'maxInvestment must be greater than or equal to minInvestment' });
        }

        const settings = await prisma.settings.upsert({
            where: { id: GLOBAL_ID },
            update: data,
            create: { id: GLOBAL_ID, ...data },
        });

        // The console PUTs the entire form on every save, so log the diff
        // against `existing` rather than the payload — otherwise every entry
        // would list all fifteen fields whether or not they moved.
        const changes = changedFields(existing, settings);
        if (changes) {
            recordAudit(req, {
                action: 'settings.update',
                targetType: 'settings',
                targetId: GLOBAL_ID,
                targetLabel: 'Platform settings',
                metadata: { changes },
            });
        }

        res.status(200).json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getPublicSettings, getSettings, updateSettings };
