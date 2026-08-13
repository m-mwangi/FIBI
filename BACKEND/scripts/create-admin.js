const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const { prisma, connectDB } = require("../config/db");
const { validateEmailForSignup } = require("../utils/email-validation.util");
const { validatePassword } = require("../utils/password-policy.util");

// Must match BCRYPT_ROUNDS in controllers/auth.controller.js — an admin hashed
// at a weaker factor than investors would be the cheapest account to crack.
const BCRYPT_ROUNDS = 12;

async function main() {
    const [, , name, rawEmail, password] = process.argv;
    if (!name || !rawEmail || !password) {
        console.error('Usage: npm run create-admin -- "Admin Name" admin@yourdomain.com your-password');
        process.exit(1);
    }

    // Admin credentials go through the same admission rules as everyone else.
    const emailCheck = await validateEmailForSignup(rawEmail);
    if (!emailCheck.ok) {
        console.error("Rejected email:", emailCheck.error);
        process.exit(1);
    }
    const email = emailCheck.email;

    const passwordCheck = validatePassword(password, { email, name });
    if (!passwordCheck.ok) {
        console.error("Rejected password:", passwordCheck.error);
        process.exit(1);
    }

    await connectDB();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.error("User already exists:", email);
        await prisma.$disconnect();
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "admin",
            passwordChangedAt: new Date(),
        },
    });

    console.log("Admin created:", user.email, user.id);
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
