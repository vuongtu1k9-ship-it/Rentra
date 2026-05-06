import { db } from './server/src/db/index.mts';
import { user } from './server/src/db/schema.mts';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log("Seeding users...");
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    await db.insert(user).values([
      {
        id: 1,
        username: "Admin",
        email: "admin@mail.com",
        password: adminPassword,
        role: "admin",
      },
      {
        id: 2,
        username: "User",
        email: "user@mail.com",
        password: userPassword,
        role: "user",
      }
    ]).onConflictDoNothing();
    
    console.log("Seeding success!");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
  process.exit(0);
}

seed();
