import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.number().positive(),
  date: z.coerce.date(),
  typeId: z.string().min(1),
  note: z.string().max(300).optional().nullable()
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const emiSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  emiType: z.string().min(1),
  dueDay: z.number().int().min(1).max(31),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
});

export const recurringSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  amount: z.number().positive(),
  dueDay: z.number().int().min(1).max(31)
});

export const personSchema = z.object({
  name: z.string().min(1).max(80)
});

export const transactionSchema = z.object({
  type: z.enum(['lend', 'borrow']),
  amount: z.number().positive(),
  dueDate: z.coerce.date().optional().nullable(),
  note: z.string().max(300).optional().nullable(),
  personId: z.string().min(1)
});

export const settlementSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.coerce.date().default(new Date())
});

export const paidMarkSchema = z.object({
  itemType: z.enum(['emi', 'recurring']),
  itemId: z.string().min(1),
  month: z.number().int().min(0).max(11),
  year: z.number().int().min(2000),
  paidDate: z.coerce.date(),
  note: z.string().max(300).optional().nullable()
});

export const settingsSchema = z.object({
  currency: z.string().default('INR'),
  monthlyBudget: z.number().positive().optional().nullable(),
  darkMode: z.enum(['auto', 'light', 'dark']).default('auto'),
  emailReminders: z.boolean().default(false),
  reminderFrequency: z.enum(['daily', '3_days_before', 'weekly']).default('3_days_before')
});

export const expenseTypeSchema = z.object({
  name: z.string().min(1).max(60),
  icon: z.string().optional().nullable()
});

export const categoryBudgetSchema = z.object({
  typeId: z.string().min(1),
  amount: z.number().positive()
});
