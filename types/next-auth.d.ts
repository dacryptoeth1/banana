import type { DefaultSession } from 'next-auth';
import type { CountryCode } from '@/lib/mock-data';

declare module 'next-auth' {
  interface Session {
    user: { country?: CountryCode } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    country?: CountryCode;
  }
}
