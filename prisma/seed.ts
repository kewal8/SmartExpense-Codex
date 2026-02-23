import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TYPES = [
  'Food',
  'Petrol',
  'Pet',
  'Travel',
  'Grocery',
  'Online Shopping',
  'Rent',
  'Maintenance',
  'Medical',
  'Entertainment',
  'Utilities',
  'Other'
];

const DEFAULT_EMI_TYPES = [
  'Home Loan',
  'Car Loan',
  'Personal Loan',
  'Education Loan',
  'Credit Card',
  'Other'
];

async function seedTypesForUser(userId: string) {
  const count = await prisma.expenseType.count({ where: { userId } });
  if (count === 0) {
    await prisma.expenseType.createMany({
      data: DEFAULT_TYPES.map((name) => ({
        userId,
        name,
        isDefault: true
      }))
    });
  }

  const emiTypeCount = await prisma.emiType.count({ where: { userId } });
  if (emiTypeCount === 0) {
    await prisma.emiType.createMany({
      data: DEFAULT_EMI_TYPES.map((name) => ({
        userId,
        name,
        isDefault: true
      }))
    });
  }
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    await seedTypesForUser(user.id);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
