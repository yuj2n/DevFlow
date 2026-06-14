# [기술 가이드] API Route Proxy 패턴을 이용한 Swagger JSON CORS 제한 우회

본 문서는 프로젝트 **DevFlow**의 Swagger 문서 공유 페이지에서 외부 API 명세 URL을 호출할 때 발생하는 동일 출처 정책(CORS) 제한을 안전하게 해결하기 위한 Next.js 15 서버 프록시 라우터 구축 가이드입니다.

## 1. 개요

브라우저 환경(Client Side)에서 타 도메인의 `swagger.json` 엔드포인트를 `axios`나 `fetch`로 직접 호출하면 브라우저 보안 정책인 CORS(Cross-Origin Resource Sharing) 에러가 발생하여 데이터를 읽어올 수 없습니다. 서버 사이드 환경에서는 CORS 제한을 받지 않는다는 특성을 활용하여, Next.js API Route를 중계 서버로 활용하는 **프록시(Proxy) 패턴**을 구현합니다.

## 2. 주요 설정 단계

### 2.1 Next.js 15 서버 사이드 프록시 라우터 구현

클라이언트의 요청을 받아 외부 Swagger URL로 데이터를 대신 요청하고 결과를 반환하는 API 라우터를 생성합니다. 외부 URL을 서버가 대신 호출하는 특성상 발생할 수 있는 내부망 침투(SSRF) 공격을 방어하기 위해 프로토콜 검증, 사설 IP 및 로컬 호스트 대역 차단 패턴이 포함되어 있으며, 리소스 고갈을 막기 위해 최대 컨텐츠 길이 및 리다이렉트 횟수 제한이 적용되어 있습니다.

파일명: `app/api/proxy-swagger/route.ts`

````TypeScript
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
  }

  // 1. 유효한 URL 형식 검증
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "유효하지 않은 URL입니다." }, { status: 400 });
  }

  // 2. 프로토콜 검증 (HTTP/HTTPS만 허용)
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "HTTP/HTTPS만 지원합니다." }, { status: 400 });
  }

  // 3. SSRF(Server-Side Request Forgery) 방어를 위한 내부망/로컬 호스트 차단
  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,   // 클라우드 인프라 link-local 대역 차단
    /^0\.0\.0\.0$/,   // 모든 네트워크 인터페이스를 통한 SSRF 우회 패턴 차단
    /^::1$/,         // IPv6 localhost 차단
    /^fe80:/i,       // IPv6 link-local 차단
  ];

  if (blockedPatterns.some((pattern) => pattern.test(hostname))) {
    return NextResponse.json(
      { error: "허용되지 않는 호스트입니다. (보안 구역)" },
      { status: 403 },
    );
  }

  try {
    // 4. 보안 설정이 강화된 Axios 요청 수행 (CORS 제한 없음)
    const response = await axios.get(url, {
      timeout: 10000,                  // 원격 서버 지연에 대비한 10초 타임아웃
      maxContentLength: 5 * 1024 * 1024, // 대용량 파일 요청으로 인한 메모리 고갈 방지 (5MB 제한)
      maxRedirects: 3,                 // 무한 리다이렉트 루프 방지 (최대 3회)
    });

    // 외부 가공 데이터 그대로 클라이언트에 전달
    return NextResponse.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("Swagger Proxy Error:", errorMessage);

    return NextResponse.json(
      { error: "데이터를 가져오지 못했습니다.", details: errorMessage },
      { status: 500 },
    );
  }
}

### 2.2 클라이언트단 프록시 엔드포인트 연동

기존 외부 URL을 직접 찌르던 로직을 방금 만든 내부 프록시 라우터 주소로 우회하여 요청합니다.

파일명: `components/Swagger/SwaggerImport.tsx` 내부 일부
링크: https://github.com/yuj2n/DevFlow/blob/main/app/api/proxy-swagger/route.ts

```typescript
const handleImport = async () => {
  if (!url) return;
  setIsLoading(true);

  try {
    // 외부 주소를 바로 호출하지 않고, 내부 프록시 주소에 쿼리로 래핑하여 전송
    const response = await axios.get<SwaggerData>(
      `/api/proxy-swagger?url=${encodeURIComponent(url)}`,
    );
    processSwaggerJson(response.data);
  } catch (error) {
    alert("데이터를 불러오는데 실패했습니다. URL을 확인해주세요.");
  } finally {
    setIsLoading(false);
  }
};
````

## 3. 주의사항

- **URL 인코딩**: 외부 URL에는 `?`, `&`, `=` 등 쿼리 스트링 특수문자가 포함되어 있을 확률이 높으므로, 프록시로 넘길 때 반드시 `encodeURIComponent(url)` 처리를 해주어야 Next.js 라우터가 주소를 오인하지 않습니다.
