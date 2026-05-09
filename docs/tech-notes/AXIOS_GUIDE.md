## # [기술 가이드] Axios 기반의 클라이언트 통신 레이어 마이그레이션

본 문서는 Native Fetch API에서 **Axios** 라이브러리로의 전환 배경과 타입 안정성이 확보된 에러 핸들링 기법을 다룹니다.

### 1. Axios 도입 이유

- **선언적 에러 처리**: `response.ok` 체크 없이 `try-catch`만으로 4xx, 5xx 에러 포착 가능.
- **자동 직렬화**: JSON 변환(`res.json()`) 과정 생략을 통한 코드 간소화.
- **확장성**: 향후 인터셉터를 통한 공통 헤더 주입 및 로깅 기반 마련.

### 2. Type-Safe 에러 핸들링 (Type Guard)

TypeScript 환경에서 `unknown` 에러 객체로부터 서버 메시지를 안전하게 추출하기 위해 `axios.isAxiosError` 가드를 사용합니다.

**파일명: `lib/github.ts**`

```typescript
import axios from "axios";

export const requestGithubPush = async (params: PushParams) => {
  try {
    const { data } = await axios.post("/api/github-push", params);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 서버에서 전달한 커스텀 에러 메시지 우선 노출
      throw new Error(
        error.response?.data?.error || "통신 오류가 발생했습니다.",
      );
    }
    throw new Error("알 수 없는 에러 발생");
  }
};
```

---

## 후배 개발자를 위한 팁
- "fetch가 내장 함수라 편해 보이지만, 규모가 커지면 axios의 인터셉터나 자동 설정 기능이 훨씬 강력합니다. 처음부터 라이브러리를 쓰기보다 fetch로 고생을 조금 해본 뒤에 axios로 넘어오면 그 편리함을 체감할 수 있을 거예요."