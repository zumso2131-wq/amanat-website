import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Телефон', type: 'text', placeholder: '+7 (777) 123-45-67' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error('Введите телефон и пароль');
        }

        // Нормализация телефона (убираем всё кроме цифр и +)
        const normalizedPhone = credentials.phone.replace(/[^\d+]/g, '');

        const user = await prisma.user.findUnique({
          where: { phone: normalizedPhone },
          include: {
            client: true,
          },
        });

        if (!user) {
          throw new Error('Неверный телефон или пароль');
        }

        if (!user.isActive) {
          throw new Error('Ваш аккаунт заблокирован');
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error('Неверный телефон или пароль');
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.fullName,
          role: user.role,
          clientId: user.client?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.clientId = user.clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.phone = token.phone as string;
        session.user.clientId = token.clientId as string | null;
      }
      return session;
    },
  },
};
