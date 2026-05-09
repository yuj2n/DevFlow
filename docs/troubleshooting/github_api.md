## 🚀 트러블슈팅: GitHub API 연동 시 사용자 식별자 불일치 해결

### 1. 문제 상황 (Issue)

- **현상**: 에디터에서 작성한 문서를 GitHub로 푸시할 때, 클라이언트에서는 `500 Internal Server Error`가 발생하고 서버 로그에는 `404 Not Found`가 기록됨.
- **환경**: Next.js, NextAuth.js, Octokit(GitHub REST API).

### 2. 원인 분석 (Root Cause)

GitHub REST API를 사용하여 콘텐츠를 업데이트(PUT)할 때 엔드포인트는 다음과 같은 구조를 가집니다:
`https://api.github.com/repos/{owner}/{repo}/contents/{path}`

로그 분석 결과, `{owner}` 파라미터에 GitHub Username(ID)이 아닌 Display Name(표시 이름)이 전달되고 있었습니다.

- **잘못된 값**: `Yujin Jeon` (NextAuth의 `session.user.name` 값)
- **실제 ID**: `yuj2n` (GitHub 계정 고유 ID)
- **결과**: GitHub 서버는 `Yujin Jeon`이라는 유저를 찾지 못해 `404 Not Found`를 응답했고, 이를 처리하는 과정에서 우리 서버는 `500` 에러를 반환함.

### 3. 해결 과정 (Resolution)

#### **Step 1: NextAuth 인증 데이터 확장**

기본 NextAuth 세션에는 `name`, `email`만 포함되므로, GitHub의 진짜 아이디인 `login` 값을 가져오도록 설정을 수정했습니다.

```typescript
// app/api/auth/[...nextauth]/route.ts
callbacks: {
  async jwt({ token, account, profile }) {
    if (account && profile) {
      // GitHubProfile에서 login(아이디)을 추출하여 토큰에 저장
      token.username = (profile as GithubProfile).login;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      // 토큰의 username을 세션으로 전달
      session.user.username = token.username;
    }
    return session;
  }
}

```

#### **Step 2: TypeScript 타입 안정성 확보**

`session.user.username`에 접근할 때 발생하는 타입 에러를 해결하기 위해 Module Augmentation을 적용했습니다.

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      username?: string;
    } & DefaultSession["user"];
  }
}
```

#### **Step 3: API 호출 로직 수정**

에디터 페이지에서 푸시 요청 시, 표시 이름이 아닌 세션에 저장된 `username`을 사용하도록 변경했습니다.

```typescript
// app/documents/[id]/page.tsx
await requestGithubPush({
  owner: session?.user?.username || "yuj2n", // 진짜 ID 사용
  repo: selectedRepo,
  // ...
});
```

### 4. 결과 및 교훈 (Lessons Learned)

- **데이터 무결성**: 외부 API 연동 시에는 사람이 보는 이름(Display Name)과 시스템이 식별하는 이름(ID/Unique Key)을 엄격히 구분해야 함을 배웠습니다.
- **디버깅 스택**: 브라우저 콘솔(500)만 보는 것이 아니라, 서버 터미널 로그와 실제 API 요청 URL을 대조하여 정확한 에러 지점을 찾는 과정이 중요함을 깨달았습니다.
- **타입 시스템 활용**: `any`를 남발하기보다 TypeScript의 인터페이스 확장을 통해 안전하게 전역 상태를 관리하는 법을 익혔습니다.