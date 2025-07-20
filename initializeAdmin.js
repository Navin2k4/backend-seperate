import bcryptjs from "bcryptjs";
import { User, Role } from "./models/database.js";

async function initializeAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables."
    );
  }

  // Seed "admin" and "user" roles if they don't exist
  const rolesToSeed = ["admin", "user"];
  for (const roleName of rolesToSeed) {
    const existingRole = await Role.findOne({ where: { name: roleName } });
    if (!existingRole) {
      await Role.create({ name: roleName });
      console.log(`Role '${roleName}' created.`);
    }
  }

  // Check if admin user exists
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log("Admin already exists.");
    return;
  }

  // Create admin user
  const hashedPassword = bcryptjs.hashSync(adminPassword, 10);

  const adminUser = await User.create({
    username: "Admin",
    email: adminEmail,
    password: hashedPassword,
    isAdmin: true,
  });

  // Assign "admin" role to admin user
  const adminRole = await Role.findOne({ where: { name: "admin" } });
  await adminUser.addRole(adminRole);

  console.log("Admin user and role created successfully.");
}

export default initializeAdmin;