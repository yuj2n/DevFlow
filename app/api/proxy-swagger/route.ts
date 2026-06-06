import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
  }

  // URL 검증: 프로토콜 및 호스트 제한
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "유효하지 않은 URL입니다." },
      { status: 400 },
    );
  }

  // SSRF 방지: HTTP/HTTPS만 허용
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "HTTP/HTTPS만 지원합니다." },
      { status: 400 },
    );
  }

  // SSRF 방지: 사설망 및 내부 IP 블랙리스트 패턴 검증
  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./, // 클라우드 인프라 link-local 대역 차단
    /^::1$/, // IPv6 localhost 차단
    /^fe80:/i, // IPv6 link-local 차단
  ];

  if (blockedPatterns.some((pattern) => pattern.test(hostname))) {
    return NextResponse.json(
      { error: "허용되지 않는 호스트입니다. (보안 구역)" },
      { status: 403 },
    );
  }

  try {
    // 가용성 확보: 인프라 오버헤드 방지를 위한 요청 스펙 제한
    const response = await axios.get(url, {
      timeout: 10000, // 10초 타임아웃
      maxContentLength: 5 * 1024 * 1024, // 용량 과부하 방지 (5MB 제한)
      maxRedirects: 3, // 무한 리디렉션 루프 방지
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Swagger fetch error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: "데이터를 가져오지 못했습니다.", details: errorMessage },
      { status: 500 },
    );
  }
}
