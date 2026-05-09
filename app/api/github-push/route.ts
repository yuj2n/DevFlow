import { getToken } from "next-auth/jwt";
import { Octokit } from "octokit";
import { NextRequest, NextResponse } from "next/server";

interface GitHubError {
  status: number;
  message?: string;
}

export async function POST(req: NextRequest) {
  // 1. getToken은 요청(req)의 쿠키에서 직접 복호화된 JWT를 가져옵니다.
  // 세션 콜백을 거치지 않으므로 브라우저 노출 위험이 가장 적습니다.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const accessToken = token?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "GitHub 인증 토큰이 없습니다. 다시 로그인해주세요." },
      { status: 401 },
    );
  }

  try {
    const { owner, repo, path, content, message } = await req.json();

    // 필수 파라미터 검증
    if (!owner || !repo || !path || !content) {
      return NextResponse.json(
        { error: "필수 정보(레포지토리, 경로, 내용)가 누락되었습니다." },
        { status: 400 },
      );
    }

    const octokit = new Octokit({ auth: accessToken });

    // 기존 파일 SHA 확인
    let sha: string | undefined;

    // unknown 에러를 안전하게 확인하기 위한 타입 가드 함수
    const isGitHubError = (error: unknown): error is GitHubError => {
      return typeof error === "object" && error !== null && "status" in error;
    };

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      if (!Array.isArray(data)) {
        sha = data.sha;
      }
    } catch (err: unknown) {
      // 파일이 없는 404 상태면 신규 생성이므로 통과, 그 외는 에러 처리
      if (isGitHubError(err) && err.status === 404) {
        sha = undefined;
      } else {
        throw err;
      }
    }

    // 파일 생성 또는 업데이트
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: message || `Docs: ${path} updated via DevFlow`,
      content: Buffer.from(content).toString("base64"),
      sha,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("GitHub Push Error:", error);

    // 1. 표준 Error 객체인 경우
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. 그 외 알 수 없는 에러인 경우
    return NextResponse.json(
      { error: "GitHub 통신 중 알 수 없는 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
