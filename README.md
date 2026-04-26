# 🚀 DevFlow

> **AI 기반 API 보안 진단 및 개발자 통합 워크플로우 플랫폼**

## 📌 프로젝트 개요

**DevFlow**는 개발자가 문서를 작성함과 동시에 API를 테스트하고, AI를 통해 보안 취약점을 실시간으로 진단받는 통합 DX(Developer Experience) 환경을 제공합니다. 파편화된 도구들을 하나로 통합하여 개발 효율성을 극대화합니다.

---

## 📅 프로젝트 로드맵 및 진행 상황

### [Phase 1: 기획 및 설계 (1~5주차)] ✅

- **작업 내용:** 프로젝트 주제 선정 및 요구사항 구체화
- **상세:** 기존 Swagger 및 문서 도구의 파편화 문제 분석을 통한 서비스 방향성 확정

### [Phase 2: 핵심 기능 구현 및 환경 구축 (6~10주차)] 🔄 (현재 단계)

- **6주차: 기술 스택 확정 및 초기 스캐폴딩** ✅
  - Next.js 14(App Router) 기반 프로젝트 초기 설정
  - Tiptap 에디터 도입을 위한 라이브러리 검토
- **7주차: 에디터 기초 UI 및 커스텀 노드 설계** ✅
  - Tiptap 에디터 기본 렌더링 및 `/` 커맨드 메뉴 초기 프로토타입 구현
  - AI 연동을 위한 데이터 인터페이스 정의
- **8주차 (현재): Swagger 파서 기초 로직 및 AI 프롬프트 테스트** 🔄
  - OpenAPI(JSON) 데이터 추출을 위한 기초 파싱 로직 작성
  - Gemini API를 활용한 보안 진단용 프롬프트 초안 설계
- **9~10주차 (예정):** AI 보안 진단 기능 연동 및 10주차 기술자료(Tutorial) 문서화 완료

### [Phase 3: 고도화 및 최종 완성 (11~15주차)] 📅

- **11~12주차:** React Flow 시각화 엔진 통합 및 성능 최적화
- **13~14주차:** GitHub API 연동을 통한 무중단 동기화 로직(DB-less) 완성
- **15주차:** 최종 결과물 시연 및 보고서 제출

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Editor Engine:** Tiptap
- **AI:** Google Gemini API
- **State Management:** Zustand, TanStack Query
- **Style:** Tailwind

---

## 📝 [8주차] 작업 상세 및 AI 활용 기록

### 1. 작업 내용 (Human Implementation)

- **에디터 스켈레톤 구현:** Next.js 환경에서 Tiptap 에디터가 정상적으로 렌더링되도록 기본 래퍼 컴포넌트 구현.
- **데이터 모델 설계:** Swagger JSON에서 `paths`, `parameters`, `responses` 정보를 추출하기 위한 TypeScript 인터페이스 정의.

### 2. AI 활용 작업 과정 (AI Prompting Record)

> 교수님 지침에 따라 AI에게 구현을 시킨 과정과 결과물을 기록으로 남깁니다.

- **프롬프트 1:** "Next.js 14에서 Tiptap을 사용할 때, 툴바 없이 명령어로만 동작하는 미니멀한 에디터 환경을 설정하는 법을 알려줘."
  - **결과:** `useEditor` 훅의 `extensions` 설정법과 `EditorContent` 컴포넌트 활용법을 학습하여 초기 UI에 적용함.
- **프롬프트 2:** "OpenAPI 3.0 명세(JSON)에서 특정 엔드포인트의 보안 관련 필드를 탐지하기 위한 Gemini API용 프롬프트를 짜줘."
  - **결과:** AI가 추천한 프롬프트 구조를 바탕으로 현재 보안 진단 로직의 초안을 작성 중임.
