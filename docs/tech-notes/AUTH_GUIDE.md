# [기술 가이드] Next.js 15 & NextAuth.js 인증 시스템 구축

본 문서는 프로젝트 **DevFlow**에 적용된 GitHub OAuth 인증 시스템의 구축 방법과 주요 기술적 설정 사항을 정리한 가이드입니다.

## 1. 개요

Next.js 15 환경에서 외부 인증 라이브러리인 **NextAuth.js**를 활용하여 보안성이 확보된 소셜 로그인 기능을 구현합니다.

## 2. 주요 설정 단계

### 2.1 GitHub OAuth 애플리케이션 등록

1. GitHub 계정의 `Settings > Developer Settings > OAuth Apps`로 이동합니다.
2. `New OAuth App`을 생성하고 아래 정보를 입력합니다.
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. 발급된 `Client ID`와 `Client Secret`을 기록합니다.

### 2.2 환경 변수 설정 (.env.local)

프로젝트 루트에 환경 변수 파일을 생성하여 민감한 정보를 관리합니다.

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=여러분의_비밀키 (openssl rand -base64 32 등으로 생성)
GITHUB_ID=발급받은_ID
GITHUB_SECRET=발급받은_Secret
```

### 2.3 전역 세션 주입 (Providers 컴포넌트)

App Router 환경에서는 Root Layout이 서버 컴포넌트이므로, 클라이언트 측에서 세션을 공유하기 위해 전용 Provider를 생성해야 합니다.

```tsx
"use client";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

## 3. 핵심 기술: Module Augmentation (타입 확장)

NextAuth에서 기본으로 제공하지 않는 속성(예: `accessToken`)을 사용하기 위해서는 타입스크립트의 **선언 병합(Declaration Merging)** 기능을 활용해야 합니다.

파일명: `types/next-auth.d.ts`
링크: https://github.com/yuj2n/DevFlow/blob/main/types/next-auth.d.ts

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // 세션 객체에 accessToken 타입 추가
  }
}
```

## 4. 주의사항

- **이미지 보안 정책**: GitHub 프로필 이미지를 출력하려면 `next.config.ts`의 `remotePatterns` 설정에 `avatars.githubusercontent.com` 도메인을 반드시 추가해야 합니다.
- **서버 재시작**: `.env.local`이나 `next.config.ts`를 수정했을 경우 반드시 개발 서버를 재시작해야 변경 사항이 반영됩니다.
