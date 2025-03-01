const bcrypt = require("bcrypt");
const { User, sequelize } = require("./src/models");

async function seedAdmin() {
  try {
    await sequelize.sync();
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        age: 30,
        education: "BS",
      });
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user already exists.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
