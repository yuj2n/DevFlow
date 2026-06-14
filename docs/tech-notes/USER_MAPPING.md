# [기술 가이드] GitHub API 연동 및 식별자 정밀 매핑 (Username)

본 문서는 GitHub REST API 호출 시 발생하는 경로 오류를 방지하고, 유저별 고유 저장소 접근을 위한 식별자 매핑 과정을 정리한 가이드입니다.

### 1. 문제 배경

GitHub API 엔드포인트(`repos/{owner}/{repo}`) 구성 시, `owner` 파라미터에 유저의 표시 이름(Name)을 사용할 경우 공백 및 중복 문제로 인해 `404 Not Found` 에러가 발생합니다. 이를 해결하기 위해 GitHub 고유 식별자인 Login ID(Username)를 추출하여 관리해야 합니다.

### 2. 기술적 해결: JWT 및 세션 확장

NextAuth의 콜백 시스템을 활용하여 깃허브가 제공하는 `profile.login` 값을 세션 전역으로 전달합니다.

**파일명: `app/api/auth/[...nextauth]/route.ts**`

```typescript
callbacks: {
  async jwt({ token, account, profile }) {
    if (account && profile) {
      // GitHubProfile 타입 단언을 통해 login(아이디) 추출
      token.username = (profile as GithubProfile).login;
      token.accessToken = account.access_token;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      // 세션 유저 객체에 고유 아이디 주입
      session.user.username = token.username;
    }
    return session;
  }
}

```

### 3. Module Augmentation 적용

확장된 `username` 필드를 타입스크립트가 인식할 수 있도록 인터페이스를 재정의합니다.

파일명: `types/next-auth.d.ts`
링크: https://github.com/yuj2n/DevFlow/blob/main/app/api/auth/%5B...nextauth%5D/route.ts

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username?: string; // GitHub Login ID 속성 추가
    } & DefaultSession["user"];
  }
  interface JWT {
    username?: string; // 토큰 객체 타입 확장
  }
}
```

---

## 후배 개발자를 위한 팁

- 깃허브의 "표시용 닉네임(name)과 시스템이 식별하는 이름(login/id)은 엄격히 다릅니다! URL 경로에 들어가는 값은 무조건 공백이 없는 식별자를 써야 에러를 피할 수 있습니다."
