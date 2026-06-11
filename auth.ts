import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ profile }) {
      const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
      const email = profile?.email?.trim().toLowerCase();
      if (!allowed || !email) return false;
      return email === allowed;
    },
  },
});
