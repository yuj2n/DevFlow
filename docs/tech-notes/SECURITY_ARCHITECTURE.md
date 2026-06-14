## # [기술 가이드] Zero-Exposure: 보안 지향적 서버 사이드 API 설계

본 문서는 클라이언트 측에 민감한 인증 정보를 노출하지 않고 안전하게 외부 API를 호출하는 **Proxy API 패턴**에 대해 설명합니다.

### 1. 설계 원칙 (Security Principle)

클라이언트(브라우저) 세션에는 유저의 `accessToken`을 포함시키지 않습니다. 이는 XSS(Cross-Site Scripting) 공격 시 토큰이 탈취되는 리스크를 원천 차단하기 위함입니다.

### 2. 구현 방식: `getToken` 활용

서버 컴포넌트나 API Route 내부에서만 접근 가능한 JWT로부터 직접 토큰을 읽어 GitHub API와 통신합니다.

파일명: `app/api/github-push/route.ts`
링크: https://github.com/yuj2n/DevFlow/blob/main/app/api/github-push/route.ts

```typescript
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  // 클라이언트가 아닌 서버 환경에서 직접 JWT 읽기
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 서버 측에서만 토큰을 사용해 Octokit 인스턴스 생성
  const octokit = new Octokit({ auth: accessToken });
  // ... 이후 로직 수행
}
```

---

## 후배 개발자를 위한 팁

- "보안의 기본은 '브라우저(사용자)를 믿지 않는 것'입니다. 중요한 토큰이나 비밀 키는 무조건 서버(API Route) 안에서만 있게 해야합니다. 브라우저 개발자 도구의 Network 탭을 열었을 때 내 토큰이 보인다면 보안상의 위험이 높습니다."
