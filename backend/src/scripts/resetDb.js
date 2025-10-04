import prisma from '../config/database.js';

async function reset() {
  console.log('WARNING: This will delete ALL app data in the connected database schema.');
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
  try {
    // Truncate only app tables and reset identity sequences
    // Order is handled by CASCADE; quoting preserves case-sensitive identifiers
    await prisma.$executeRawUnsafe('
      TRUNCATE TABLE "Approval", "Expense", "ApprovalRule", "User", "Company" RESTART IDENTITY CASCADE;
    ');
    console.log('All app tables truncated and identities reset.');
  } catch (e) {
    console.error('Error while truncating tables:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
