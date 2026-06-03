import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Find user by email
        const rows = await sql`
          SELECT * FROM users WHERE email = ${credentials.email}
        `;
        const user = rows[0];
        if (!user) return null;

        // 2. Compare submitted password with stored hash
        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        // 3. Return plain object — this becomes the JWT payload
        return {
          id:    String(user.id),
          name:  user.name,
          email: user.email,
          role:  user.role,
        };
      },
    }),
  ],

  callbacks: {
    // jwt callback: runs when JWT is created or updated
    // We attach role here so it's inside the token
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },

    // session callback: runs when session is read on the frontend
    // We expose role and id to the client session object
    async session({ session, token }) {
      session.user.id   = token.id;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: '/login',  // your custom login page (we'll build later)
  },

  session: {
    strategy: 'jwt',  // store session in JWT, not a DB session table
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Next.js App Router needs named exports for each HTTP method
export { handler as GET, handler as POST };