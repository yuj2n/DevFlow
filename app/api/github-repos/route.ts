import { getToken } from "next-auth/jwt";
import { Octokit } from "octokit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "인증 토큰이 없습니다." },
      { status: 401 },
    );
  }

  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    const repos = data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
    }));

    return NextResponse.json(repos);
  } catch (error: unknown) {
    console.error("GitHub Repos Fetch Error:", error);
    return NextResponse.json({ error: "목록 로드 실패" }, { status: 500 });
  }
}
