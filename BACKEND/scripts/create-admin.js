const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const { prisma, connectDB } = require("../config/db");

async function main() {
    const [, , name, email, password] = process.argv;
    if (!name || !email || !password) {
        console.error('Usage: npm run create-admin -- "Admin Name" admin@example.com your-password');
        process.exit(1);
    }

    await connectDB();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.error("User already exists:", email);
        await prisma.$disconnect();
        process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: "admin" },
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
