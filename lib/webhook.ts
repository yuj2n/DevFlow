import axios from "axios";

interface SendWebhookParams {
  url: string;
  title: string;
  action: "create" | "update" | "share";
  author?: string;
}

export async function sendNotificationWebhook({
  url,
  title,
  action,
  author,
}: SendWebhookParams) {
  if (!url) return;

  // 디스코드 스파이디 봇이 채널에 예쁘게 출력할 메시지 포맷 조립
  const actionText =
    action === "create"
      ? "🚀 새로운 API 문서가 생성되었습니다."
      : action === "update"
        ? "📝 API 문서의 편집 사항이 저장되었습니다."
        : "🎉 GitHub 파이프라인으로 API 명세 배포가 완료되었습니다.";

  const fallbackUser = author || "DevFlow User";

  // 디스코드 마크다운 서식을 수용하는 페이로드 구성
  const payload = {
    content: `🔔 **[DevFlow 실시간 알림]**\n${actionText}\n> **문서 제목:** \`${title}\`\n> **발행 작업자:** \`${fallbackUser}\``,
  };

  try {
    // 사용자가 설정창에 기입한 디스코드 엔드포인트 URL로 포스트 요청 발송
    await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Webhook 알림 발송 중 실패:", error);
  }
}
