import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: requireEnv("GITHUB_ID"),
      clientSecret: requireEnv("GITHUB_SECRET"),
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const githubProfile = profile as GithubProfile;
        token.accessToken = account.access_token;
        token.username = githubProfile.login;
      }
      return token;
    },
    async session({ session, token }) {
      // [보안 수정]: 서버 API(github-push)에서는 getToken을 통해 JWT에서 직접 토큰을 읽어옵니다.
      if (session.user) {
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
