import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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

async function seedDefaultTypes(userId: string) {
  const hasAny = await prisma.expenseType.count({ where: { userId } });
  if (!hasAny) {
    await prisma.expenseType.createMany({
      data: DEFAULT_TYPES.map((name) => ({ name, userId, isDefault: true }))
    });
  }

  const hasEmiTypes = await prisma.emiType.count({ where: { userId } });
  if (!hasEmiTypes) {
    await prisma.emiType.createMany({
      data: DEFAULT_EMI_TYPES.map((name) => ({ name, userId, isDefault: true }))
    });
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.password) {
          return null;
        }

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user }) {
      if (user.id) {
        await seedDefaultTypes(user.id);
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? '');
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
