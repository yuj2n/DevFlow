# [AI 협업 기록] GitHub 인증 시스템 및 UI 개발 공정

본 문서는 **DevFlow** 프로젝트 구현 과정에서 발생한 AI(Gemini)와의 협업 내역을 투명하게 기록한 작업 일지입니다.

## 1. 개요

- **협업 대상**: Gemini 3 Pro (빠른 답변)
- **협업 기간**: 5~8주차 (통합 보고)
- **주요 협업 분야**: NextAuth.js 설정, TypeScript 타입 확장, UI 레이아웃 디버깅

---

## 2. 상세 협업 로그

### 🚀 [LOG-01] NextAuth.js 기반 GitHub 로그인 아키텍처 수립

- **프롬프트 (질문):** "Next.js 15 App Router 환경에서 NextAuth.js를 사용하여 GitHub 로그인을 구현하고 싶어. 설정 방법과 GitHub OAuth 앱 등록 과정을 알려줘."
- **AI 제공 해결책:**
- `app/api/auth/[...nextauth]/route.ts` 내 핸들러 구성 예제 코드 제공.
- `.env.local`에 필요한 필수 환경 변수(`GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET`) 가이드.

- **직접 수행한 작업 (Human Action):**
- 제공된 예제 코드를 바탕으로 프로젝트 구조에 맞춰 라우트 파일 생성.
- GitHub Developer Settings에서 OAuth 앱을 직접 생성하고 Client ID/Secret 발급 및 적용.
- providers.tsx 파일 내 SessionProvider 적용으로 로그인 정보 앱 전체 적용

---

### 🛠️ [LOG-02] TypeScript 타입 에러 해결 (Module Augmentation)

- **프롬프트 (질문):** "NextAuth 세션에 `accessToken`을 추가하고 싶은데 TypeScript에서 자꾸 에러가 나. `Module Augmentation`을 사용한 해결 방법을 단계별로 알려줘."
- **AI 제공 해결책:**
- `types/next-auth.d.ts` 파일을 생성하여 기본 `Session` 인터페이스를 확장하는 기술적 예제 제공.

- **직접 수행한 작업 (Human Action):**
- 단순 복사가 아닌, 프로젝트 전역 타입 경로(`@/types`)를 설정하고 `import "next-auth"` 문법을 적용하여 빌드 경고 없이 타입 안정성 확보.

---

### 🎨 [LOG-03] 사이드바 레이아웃 및 조건부 UI 구현

- **프롬프트 (질문):** "로그인 여부에 따라 사이드바 하단에 로그인 버튼 혹은 프로필과 로그아웃 버튼이 번갈아 나오게 하고 싶어. TailwindCSS로 로그아웃 버튼은 우측 끝에 배치해줘."
- **AI 제공 해결책:**
- `flex`, `justify-between`, `mt-auto`를 활용한 하단 섹션 레이아웃 코드 제공.

- **직접 수행한 작업 (Human Action):**
- AI가 제공한 기본 스타일을 프로젝트 테마색인 `slate-900`과 `blue-600`에 맞춰 리디자인.
- 사이드바 확장/축소 상태(`isExpanded`)에 따라 텍스트가 자연스럽게 사라지는 애니메이션(Transition) 로직 직접 추가.

---

### ⚠️ [LOG-04] 외부 이미지 호스트 보안 정책 대응

- **프롬프트 (질문):** "로그인 후 깃허브 이미지를 불러올 때 `hostname` 보안 에러가 나는데 어떻게 해결해?"
- **AI 제공 해결책:**
- `next.config.ts`의 `images.remotePatterns` 설정을 통해 외부 도메인을 허용하는 방법 제시.

- **직접 수행한 작업 (Human Action):**
- `avatars.githubusercontent.com` 도메인을 정확히 매칭시키고, 변경된 설정을 적용하기 위해 개발 서버를 수동 재시작(`pnpm dev`)하여 해결 완료 확인.

---

### ⚠️ [LOG-05] Next.js의 개발용 툴바 제거

- **프롬프트 (질문):** "여기 이미지보면 화면 왼쪽 하단에 N이라는 로고랑 Route: Static과 같은 내용이 뜨는데 이 아이콘 때문에 UI가 가려져서 없애고 싶은데 어떻게 해야해?"
- **AI 제공 해결책:**
- `next.config.ts`의 `devIndicators: {
  appIsrStatus: false, // ISR 상태 표시 끄기
  buildActivity: false, // 빌드 중 표시 끄기
},` 설정을 통해 개발 툴바 표시 끄는 방법 제시.

- **직접 수행한 작업 (Human Action):**
- AI의 조언대로 적용해도 사라지지 않아 Next.js 15 버전 이상에서는 'Static Indicator'가 아니라 'Dev Overlay'라는 이름으로 불려 `devIndicators: false,`로 모든 개발 지표 아이콘을 한번에 끄는 설정을 적용하고 서버를 재시작하여 해결 완료 확인.

---

## 3. AI 활용 성과 요약

| 구분              | 내용                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **효율성 증대**   | NextAuth의 복잡한 초기 설정을 AI 가이드를 통해 약 2시간 이상 단축함.                        |
| **기술적 성숙도** | TypeScript의 타입 확장 개념을 AI와 질의응답하며 깊이 있게 학습함.                           |
| **문제 해결**     | 런타임 이미지 에러 등 프레임워크 특유의 보안 정책을 AI와 실시간으로 디버깅하여 즉각 해결함. |
