// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // 세션에 accessToken이 있을 수 있다고 정의
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string; // JWT 토큰에도 accessToken이 있을 수 있다고 정의
  }
}
