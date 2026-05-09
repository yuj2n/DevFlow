import { getToken } from "next-auth/jwt";
import { Octokit, RequestError } from "octokit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 인증 토큰 확인
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "인증되지 않은 사용자입니다." },
      { status: 401 },
    );
  }

  // 쿼리 파라미터에서 owner와 repo 추출
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "owner와 repo 정보가 필요합니다." },
      { status: 400 },
    );
  }

  const octokit = new Octokit({ auth: accessToken });

  try {
    // GitHub API로 브랜치 목록 호출
    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100, // 최대 100개까지
    });

    // 4. 브랜치 이름만 추출해서 반환
    const branchNames = data.map((branch) => branch.name);
    return NextResponse.json(branchNames);
  } catch (error: unknown) {
    console.error("GitHub Branches Fetch Error:", error);

    // Octokit RequestError 확인
    if (error instanceof RequestError) {
      return NextResponse.json(
        { error: error.message || "브랜치 목록 로드 실패" },
        { status: error.status || 500 },
      );
    }

    // 일반적인 Error 객체인지 확인
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 그 외
    return NextResponse.json(
      { error: "알 수 없는 오류 발생" },
      { status: 500 },
    );
  }
}
