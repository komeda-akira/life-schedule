import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowedForSignIn } from "@/lib/auth-policy";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email?.trim().toLowerCase();
      if (!email) return false;
      return isEmailAllowedForSignIn(email);
    },
  },
});
