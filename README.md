# 🚀 DevFlow
> **AI 기반 API 보안 진단 및 개발자 통합 워크플로우 플랫폼**

## 📌 프로젝트 개요
**DevFlow**는 개발자가 문서를 작성함과 동시에 API를 테스트하고, AI를 통해 보안 취약점을 실시간으로 진단받는 통합 DX(Developer Experience) 환경을 제공합니다. 파편화된 도구들을 하나로 통합하여 개발 효율성을 극대화합니다.

---

## 📅 프로젝트 로드맵 및 진행 상황

### [Phase 1: 기획 및 설계 (1~6주차)] - **진행 중**
- **1~3주차: 환경 세팅 및 에디터 구조 설계** ✅
  - Next.js 14(App Router) 및 TypeScript 기반 프로젝트 스캐폴딩 완료
  - Tiptap 에디터 엔진 분석 및 커스텀 블록(NodeView) 아키텍처 설계 완료
- **4~6주차: 상세 기능 설계 및 기술자료 기획** 🔄 (현재 단계)
  - Swagger JSON 파싱 인터페이스 및 데이터 모델 정의
  - **[6주차 완료]** 10주차 배포 예정인 '기술자료(Tutorial)' 기획안 작성 및 2차 수정 완료
  - AI 보안 진단을 위한 Gemini API 프롬프트 엔지니어링 기초 설계

### [Phase 2: 핵심 기능 구현 (7~10주차)] - **예정**
- **7~9주차: AI 보안 진단 및 API 블록 구현**
  - Gemini API 연동을 통한 실시간 응답 취약점 분석 기능 개발
  - 입력 데이터가 보존되는 Persistent API 테스트 블록 구현
- **10주차: 기술자료(Tutorial) 최종 제출**
  - 학우들을 위한 'Tiptap 커스텀 블록 및 AI 연동 가이드' 배포

### [Phase 3: 고도화 및 최적화 (11~15주차)] - **예정**
- **11~12주차: 시각화 및 성능 최적화**
  - React Flow를 이용한 아키텍처 캔버스 통합
  - 대용량 문서 렌더링 최적화 (Lazy Loading, Web Workers)
- **13~14주차: GitHub 연동 및 동기화 완성**
  - GitHub API를 활용한 무중단 문서 커밋/푸시 워크플로우 완성 (DB-less)
- **15주차: 최종 결과물 시연 및 보고서 제출**

---

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **State Management:** Zustand, TanStack Query
- **Editor Engine:** Tiptap
- **AI:** Google Gemini API
- **Visualization:** React Flow
- **Storage:** GitHub API (Git-based CMS)
