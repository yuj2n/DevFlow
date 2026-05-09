import axios from "axios";

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
  try {
    const response = await axios.post("/api/github-push", {
      owner,
      repo,
      path,
      content,
      message,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 서버에서 보낸 에러 메시지가 없으면 기본 메시지 사용
      const serverMessage = error.response?.data?.error;
      throw new Error(serverMessage || "GitHub 푸시 중 오류가 발생했습니다.");
    }

    // 일반 에러 처리
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};
