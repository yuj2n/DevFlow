# [기술 가이드] API Route Proxy 패턴을 이용한 Swagger JSON CORS 제한 우회

본 문서는 프로젝트 **DevFlow**의 Swagger 문서 공유 페이지에서 외부 API 명세 URL을 호출할 때 발생하는 동일 출처 정책(CORS) 제한을 안전하게 해결하기 위한 Next.js 15 서버 프록시 라우터 구축 가이드입니다.

## 1. 개요

브라우저 환경(Client Side)에서 타 도메인의 `swagger.json` 엔드포인트를 `axios`나 `fetch`로 직접 호출하면 브라우저 보안 정책인 CORS(Cross-Origin Resource Sharing) 에러가 발생하여 데이터를 읽어올 수 없습니다. 서버 사이드 환경에서는 CORS 제한을 받지 않는다는 특성을 활용하여, Next.js API Route를 중계 서버로 활용하는 **프록시(Proxy) 패턴**을 구현합니다.

## 2. 주요 설정 단계

### 2.1 Next.js 15 서버 사이드 프록시 라우터 구현

클라이언트의 요청을 받아 외부 Swagger URL로 데이터를 대신 요청하고 결과를 반환하는 API 라우터를 생성합니다.

**파일명: `app/api/proxy-swagger/route.ts**`

```typescript
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  // 💡 클라이언트가 보낸 쿼리 스트링에서 대상 Swagger URL 추출
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json(
      { error: "URL 파라미터가 누락되었습니다." },
      { status: 400 },
    );
  }

  try {
    // 💡 서버 사이드에서 외부 Swagger JSON 데이터를 직접 호출 (CORS 제한 없음)
    const response = await axios.get(targetUrl, {
      timeout: 5000, // 원격 서버 지연에 대비한 5초 타임아웃 설정
    });

    // 외부 가공 데이터 그대로 클라이언트에 전달
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Swagger Proxy Error:", error.message);
    return NextResponse.json(
      { error: "원격 Swagger 데이터를 가져오는 데 실패했습니다." },
      { status: 500 },
    );
  }
}
```

### 2.2 클라이언트단 프록시 엔드포인트 연동

기존 외부 URL을 직접 찌르던 로직을 방금 만든 내부 프록시 라우터 주소로 우회하여 요청합니다.

**파일명: `components/Swagger/SwaggerImport.tsx` 내부 일부**

```typescript
const handleImport = async () => {
  if (!url) return;
  setIsLoading(true);

  try {
    // 💡 외부 주소를 바로 호출하지 않고, 내부 프록시 주소에 쿼리로 래핑하여 전송
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
```

## 3. 주의사항

- **URL 인코딩**: 외부 URL에는 `?`, `&`, `=` 등 쿼리 스트링 특수문자가 포함되어 있을 확률이 높으므로, 프록시로 넘길 때 반드시 `encodeURIComponent(url)` 처리를 해주어야 Next.js 라우터가 주소를 오인하지 않습니다.
