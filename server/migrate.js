const { createStaffTable } = require('./model/staff');
const { createCsoTable } = require('./model/cso');
const { createUserTable } = require('./model/user');
const { createApplicationFormTable, createFormTable } = require('./model/form');
const { createBeneficiaryTable } = require('./model/beneficiary');
const { createCommentsTable } = require("./model/comment");
const { createNotificationsTable } = require("./model/notification");
const { createLettersTable } = require('./model/letter');
const { contactInfoTable } = require('./model/contactInfo');
const { createNews_CommentsTable, createNewsTable  } = require('./model/news');
const { createAboutTable } = require('./model/about');
const { createHeroSlidesTable } = require('./model/hero');
const { createServiceTable } = require('./model/service');
// ... add other model table imports

async function runMigrations() {
  try {
    console.log("Starting table migrations...");
    await createLettersTable();
    await createServiceTable();
  await createHeroSlidesTable();
  await createAboutTable();
  await createNewsTable();
  await createNews_CommentsTable();
    await contactInfoTable();
    await createStaffTable();
    await createCsoTable();           
    await createUserTable();
    await createFormTable();
    await createBeneficiaryTable();
    await createApplicationFormTable();
    await createCommentsTable();
    await createNotificationsTable();

    // ... call other table functions in order (respect foreign key dependencies)
    console.log("✅ All tables created successfully.");
  } catch (error) {
    console.error("❌ Error during migration:", error);
  }
}

runMigrations();
