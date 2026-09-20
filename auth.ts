import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { COUNTRIES, type CountryCode } from '@/lib/mock-data';
import { normalizeEmail, verifyChallenge } from '@/lib/otp';

const isCountry = (c: unknown): c is CountryCode => COUNTRIES.some((x) => x.code === c);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  providers: [
    // Email-code sign-in. POST /api/auth/otp/verify checks the code, then calls signIn('otp'); authorize()
    // checks it again so this provider can't be hit directly with just an email address.
    Credentials({
      id: 'otp',
      name: 'Email code',
      credentials: { email: {}, code: {}, challenge: {} },
      authorize(creds) {
        const email = normalizeEmail(creds?.email);
        const r = verifyChallenge(String(creds?.challenge ?? ''), email, String(creds?.code ?? ''));
        return r.ok ? { id: r.email, email: r.email, name: r.name || r.email.split('@')[0] } : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      // The signup page reports the country the user picks (client calls update({ country })).
      if (trigger === 'update' && isCountry(session?.country)) token.country = session.country;
      return token;
    },
    session({ session, token }) {
      session.user.country = isCountry(token.country) ? token.country : undefined;
      return session;
    },
  },
});
