interface PushParams {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message?: string;
}

/**
 * 에디터 내용을 GitHub 레포지토리로 푸시하는 클라이언트 사이드 함수
 */
export const requestGithubPush = async ({
  owner,
  repo,
  path,
  content,
  message,
}: PushParams) => {
  const response = await fetch("/api/github-push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner,
      repo,
      path,
      content,
      message,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "GitHub 푸시 중 오류가 발생했습니다.");
  }

  return result;
};
