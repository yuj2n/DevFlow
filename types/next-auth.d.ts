// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    // accessToken?: string; <- 클라이언트 노출 방지
    user: {
      username?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    username?: string;
  }
}
