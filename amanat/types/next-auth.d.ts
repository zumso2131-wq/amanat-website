import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    phone: string;
    role: UserRole;
    clientId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone: string;
      role: UserRole;
      clientId?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    phone: string;
    clientId?: string | null;
  }
}
