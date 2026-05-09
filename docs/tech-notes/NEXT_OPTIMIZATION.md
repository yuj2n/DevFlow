# [기술 가이드] Next.js 15 환경 최적화 및 보안 설정 (Images & DevTools)

본 문서는 Next.js 15 기반 프로젝트 개발 시 발생할 수 있는 보안 정책 에러 해결 방법과 개발 환경 최적화 설정을 정리한 가이드입니다.

## 1. 외부 이미지 보안 정책 (Remote Patterns)

Next.js는 이미지 최적화(LCP 개선)와 보안을 위해, 허용되지 않은 도메인으로부터의 이미지 로딩을 기본적으로 차단합니다. GitHub 프로필 사진 등 외부 데이터를 사용할 때 필수적인 설정입니다.

### 1.1 현상

외부 URL 이미지를 `<Image />` 컴포넌트에 사용 시 아래와 같은 에러가 발생합니다.

> `Error: Invalid src prop (https://avatars.githubusercontent.com) on `next/image`, hostname "avatars.githubusercontent.com" is not configured under images in your `next.config.js`.`

### 1.2 해결 방법

`next.config.ts` 파일에서 `remotePatterns`를 정의하여 신뢰할 수 있는 도메인을 명시합니다.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // 깃허브 이미지 서버 허용
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

---

## 2. 개발 환경 지표(Dev Indicators) 관리

Next.js 15 버전부터는 화면 좌측 하단에 경로의 성격(Static/Dynamic)을 나타내는 인디케이터가 기본적으로 노출됩니다. 이는 개발 중 UI를 가릴 수 있으므로 필요에 따라 비활성화할 수 있습니다.

### 2.1 설정 방법

`next.config.ts`에서 `devIndicators` 옵션을 수정합니다.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false, // 페이지 상태(Static/ISR) 인디케이터 비활성화
    buildActivity: false, // 빌드 중 애니메이션 비활성화
  },
  // 또는 전체 비활성화를 원하는 경우
  // devIndicators: false,
};
```

---

## 3. 후배 개발자를 위한 팁

1. **서버 재시작 필수**: `next.config.ts`는 서버가 처음 구동될 때 읽히는 설정 파일입니다. 내용을 수정했다면 반드시 실행 중인 터미널을 종료하고 `pnpm dev`를 다시 실행해야 적용됩니다.
2. **최적화 도구**: `<Image />` 컴포넌트는 단순히 사진을 보여주는 것을 넘어, 브라우저 크기에 맞는 최적의 해상도를 제공하므로 웬만하면 `<img>` 대신 사용하는 것을 권장합니다.

```

```
