const { prisma } = require('../config/db');

/**
 * Append one entry to the admin audit trail.
 *
 * Deliberately never throws and never returns a rejected promise. Auditing is a
 * side record of an action that has already happened — if the write fails, the
 * user's delete/update must still succeed, and the caller must not have to wrap
 * every call site in a try/catch. Failures are logged to the server console so
 * they are still visible in operations.
 *
 * Fire-and-forget by design: callers do not await it, so the response is not
 * held open for a logging insert.
 */
function recordAudit(req, { action, targetType, targetId, targetLabel, metadata }) {
    const actor = req && req.user ? req.user : null;

    // No actor means this was not an authenticated admin action; there is
    // nothing meaningful to attribute, so skip rather than write "unknown".
    if (!actor) return Promise.resolve(null);

    return prisma.adminAuditLog
        .create({
            data: {
                actorId: actor.id,
                actorEmail: actor.email || '',
                action,
                targetType,
                targetId: targetId ? String(targetId) : null,
                targetLabel: targetLabel ? String(targetLabel).slice(0, 200) : null,
                metadata: metadata === undefined ? null : metadata,
                ip: clientIp(req),
            },
        })
        .catch((error) => {
            console.error(`[audit] failed to record "${action}":`, error.message);
            return null;
        });
}

/**
 * Best-effort client IP.
 *
 * `req.ip` already honours the `trust proxy` setting configured in index.js, so
 * it is correct behind the nginx/Cloudflare front end. Only the first hop of a
 * forwarded chain is kept — the rest is attacker-controllable and would just
 * bloat the column.
 */
function clientIp(req) {
    if (!req) return null;
    const raw = req.ip || (req.socket && req.socket.remoteAddress) || '';
    return raw ? String(raw).split(',')[0].trim().slice(0, 64) : null;
}

const IGNORED_IN_DIFF = new Set(['id', 'updatedAt', 'createdAt']);

/**
 * Diff two flat records down to what actually changed.
 *
 * Settings saves post the whole form back, so without this every save would log
 * all seventeen fields and the trail would be unreadable. Returns null when
 * nothing changed.
 */
function changedFields(before, after) {
    if (!before || !after) return null;
    const changes = {};
    for (const key of Object.keys(after)) {
        // Server-managed columns move on every write regardless of what the
        // admin edited, so they would put noise in the diff of every entry.
        if (IGNORED_IN_DIFF.has(key)) continue;
        const from = before[key];
        const to = after[key];
        if (from instanceof Date || to instanceof Date) {
            if (String(from) !== String(to)) changes[key] = { from, to };
        } else if (from !== to) {
            changes[key] = { from, to };
        }
    }
    return Object.keys(changes).length > 0 ? changes : null;
}

module.exports = { recordAudit, changedFields };
