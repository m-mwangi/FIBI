/**
 * Seeds a known-credential investor account for local development.
 *
 * Deliberately separate from create-admin.js: this one hands out a password the
 * developer already knows, so it carries guards that script does not need. It
 * refuses to run outside development and refuses to touch a database that is
 * not on this machine — a fixed, published credential on a shared or hosted
 * database is a live account anyone can sign in to.
 *
 * The default address sits on a `.local` domain, which utils/email-validation
 * rejects at signup. That is the point: nobody can register this address
 * through the public flow, so seeding it can never collide with, or shadow, a
 * real investor. Login only syntax-checks the address, so it signs in normally.
 *
 * Re-running is safe: an existing dev account has its password reset, its
 * lockout cleared and its role put back to investor.
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const { prisma, connectDB } = require("../config/db");
const { normalizeEmail, isPlausibleEmail } = require("../utils/email-validation.util");
const { validatePassword } = require("../utils/password-policy.util");

// Must match BCRYPT_ROUNDS in controllers/auth.controller.js.
const BCRYPT_ROUNDS = 12;

const DEFAULT_NAME = "Dev Investor";
const DEFAULT_EMAIL = "dev.investor@fibi.local";
const DEFAULT_PASSWORD = "LocalDevInvestor#2026";

const TIERS = ["free", "basic", "premium", "investor_plus"];
const MEMBERSHIP_DAYS = 30;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"]);

/**
 * True only when DATABASE_URL points at a database on this machine. Anything
 * unparseable counts as remote — an unreadable target is not a safe one.
 */
function databaseIsLocal(url) {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return LOCAL_HOSTS.has(hostname);
    } catch (_) {
        return false;
    }
}

async function main() {
    if ((process.env.NODE_ENV || "development") === "production") {
        console.error("Refusing to run: NODE_ENV is production.");
        process.exit(1);
    }

    if (!databaseIsLocal(process.env.DATABASE_URL)) {
        console.error(
            "Refusing to run: DATABASE_URL does not point at a local database.\n" +
                "This script seeds a fixed, known password and is for localhost only."
        );
        process.exit(1);
    }

    // `--tier=premium` seeds an active membership alongside the account, which
    // is the only way to reach the member-gated surfaces locally without
    // walking an application through the admin console and paying an invoice.
    const args = process.argv.slice(2);
    const flags = args.filter((a) => a.startsWith("--"));
    const [argName, argEmail, argPassword] = args.filter((a) => !a.startsWith("--"));

    const tierFlag = flags.find((f) => f.startsWith("--tier="));
    const tier = tierFlag ? tierFlag.slice("--tier=".length) : null;
    if (tier && !TIERS.includes(tier)) {
        console.error(`Unknown tier "${tier}". Expected one of: ${TIERS.join(", ")}`);
        process.exit(1);
    }

    const name = argName || DEFAULT_NAME;
    const email = normalizeEmail(argEmail || DEFAULT_EMAIL);
    const password = argPassword || DEFAULT_PASSWORD;

    // Login rejects a malformed address before it ever looks up the account, so
    // seeding one would produce a row that can never sign in.
    if (!isPlausibleEmail(email)) {
        console.error("Rejected email: login would reject this address as malformed.");
        process.exit(1);
    }

    // The app never checks policy at login, but a dev account that could not
    // have been created through signup makes for a misleading test fixture.
    const passwordCheck = validatePassword(password, { email, name });
    if (!passwordCheck.ok) {
        console.error("Rejected password:", passwordCheck.error);
        process.exit(1);
    }

    await connectDB();

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const existing = await prisma.user.findUnique({ where: { email } });

    // passwordChangedAt invalidates any JWT issued before now, so a reset here
    // does not leave an old dev token working against the new password.
    const user = existing
        ? await prisma.user.update({
              where: { id: existing.id },
              data: {
                  name,
                  password: hashedPassword,
                  role: "investor",
                  passwordChangedAt: new Date(),
                  failedLoginAttempts: 0,
                  lockedUntil: null,
              },
          })
        : await prisma.user.create({
              data: {
                  name,
                  email,
                  password: hashedPassword,
                  role: "investor",
                  country: "Kenya",
                  passwordChangedAt: new Date(),
              },
          });

    // Written straight to the membership row rather than through checkout: this
    // is a fixture for looking at member-only screens, not a rehearsal of the
    // payment path. Anything that tests billing should still go through
    // `settlePayment`.
    let membershipLine = null;
    if (tier && tier !== "free") {
        const renewalDate = new Date(Date.now() + MEMBERSHIP_DAYS * 24 * 60 * 60 * 1000);
        const activeMembership = {
            tier,
            status: "active",
            applicationStatus: "approved",
            startedAt: new Date(),
            renewalDate,
            canceledAt: null,
            pendingTier: null,
        };
        await prisma.userMembership.upsert({
            where: { userId: user.id },
            update: activeMembership,
            create: { userId: user.id, ...activeMembership },
        });
        membershipLine = `${tier} (active, renews ${renewalDate.toISOString().slice(0, 10)})`;
    } else if (tier === "free") {
        await prisma.userMembership.upsert({
            where: { userId: user.id },
            update: { tier: "free", status: "none", applicationStatus: "none", renewalDate: null },
            create: { userId: user.id, tier: "free" },
        });
        membershipLine = "free (no active membership)";
    }

    console.log(existing ? "Dev investor reset:" : "Dev investor created:");
    console.log("  email:    ", user.email);
    console.log("  password: ", password);
    console.log("  id:       ", user.id);
    console.log("  role:     ", user.role);
    if (membershipLine) console.log("  membership:", membershipLine);

    await prisma.$disconnect();
}

main().catch(async (err) => {
    console.error(err);
    try {
        await prisma.$disconnect();
    } catch (_) {
        /* ignore */
    }
    process.exit(1);
});
