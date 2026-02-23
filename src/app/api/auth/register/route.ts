import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8)
});

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonResponse({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }, 400);
    }

    const { name, email, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return jsonResponse({ success: false, error: 'Email already in use' }, 409);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    });

    await prisma.expenseType.createMany({
      data: DEFAULT_TYPES.map((type) => ({
        name: type,
        isDefault: true,
        userId: user.id
      }))
    });

    await prisma.emiType.createMany({
      data: DEFAULT_EMI_TYPES.map((type) => ({
        name: type,
        isDefault: true,
        userId: user.id
      }))
    });

    return jsonResponse({ success: true, data: { id: user.id, email: user.email } }, 201);
  } catch {
    return jsonResponse({ success: false, error: 'Unable to register user' }, 500);
  }
}
