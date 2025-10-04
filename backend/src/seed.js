import prisma from './config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding...');
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Acme Inc', country: 'United States', currency: 'USD' },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@acme.com', password: await bcrypt.hash('admin123', 10), role: 'Admin', companyId: company.id },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@acme.com' },
    update: {},
    create: { name: 'Manager', email: 'manager@acme.com', password: await bcrypt.hash('manager123', 10), role: 'Manager', companyId: company.id },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@acme.com' },
    update: {},
    create: { name: 'Employee', email: 'employee@acme.com', password: await bcrypt.hash('employee123', 10), role: 'Employee', companyId: company.id, managerId: manager.id },
  });

  await prisma.approvalRule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyId: company.id,
      type: 'hybrid',
      percentage: 60,
      specificApproverId: admin.id,
      isManagerApprover: true,
      approvers: [manager.id, admin.id],
    },
  });

  console.log('Seed completed');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
