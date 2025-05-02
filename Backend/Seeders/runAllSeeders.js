/**
 * Script to run all seeder files in the correct sequence
 * This ensures that dependent data is created in the right order
 */
const { spawn } = require("child_process");
const path = require("path");

// Array of seeder files in the order they should be executed
const seeders = [
  "achievementSeeder.js", // First: Create achievements
  "userSeeder.js", // Second: Create users
  "activitySeeder.js", // Third: Create activities (requires users)
  "friendInteractionSeeder.js", // Fourth: Create friend interactions (requires users)
];

// Function to run a single seeder
const runSeeder = (seederFile) => {
  return new Promise((resolve, reject) => {
    console.log(`\n======= Running ${seederFile} =======\n`);

    const seederPath = path.join(__dirname, seederFile);
    const child = spawn("node", [seederPath], { stdio: "inherit" });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ ${seederFile} completed successfully`);
        resolve();
      } else {
        console.error(`\n❌ ${seederFile} failed with code ${code}`);
        reject(new Error(`Seeder ${seederFile} failed with code ${code}`));
      }
    });

    child.on("error", (err) => {
      console.error(`\n❌ Error executing ${seederFile}:`, err);
      reject(err);
    });
  });
};

// Function to run all seeders sequentially
const runAllSeeders = async () => {
  console.log("\n🌱 Starting database seeding process...");

  try {
    // Run each seeder in sequence
    for (const seeder of seeders) {
      await runSeeder(seeder);
    }

    console.log(
      "\n✨ All seeders completed successfully! Database is now populated."
    );
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding process failed:", error.message);
    process.exit(1);
  }
};

// Execute the function
runAllSeeders();
