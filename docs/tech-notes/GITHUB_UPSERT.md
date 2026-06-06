# [기술 가이드] GitHub Octokit SDK 기반 파일 SHA 검증 및 조건부 업데이트(Upsert) 알고리즘

본 문서는 프로젝트 **DevFlow**의 GitHub 연동 페이지에서 에디터 문서를 원격 저장소에 푸시할 때, 파일의 덮어쓰기 및 신규 생성을 안전하게 판별하기 위한 SHA 체크 기반 동적 배포 알고리즘 가이드입니다.

## 1. 개요

GitHub REST API 문서 생성 스펙(`PUT /repos/{owner}/{repo}/contents/{path}`)상, 기존에 존재하는 파일을 수정할 때는 해당 파일의 최신 고유 해시값(`SHA`)을 필수 페이로드로 전송해야 합니다. 만약 SHA 값 없이 전송하면 `422 Unprocessable Entity` 에러가 발생합니다. 따라서 원격지의 상태를 먼저 조회하고 '신규 생성'과 '수정'을 동적으로 처리하는 **Upsert(Update + Insert)** 로직을 수립합니다.

## 2. 주요 파이프라인 알고리즘

### 2.1 Octokit을 활용한 조건부 SHA 바인딩 및 푸시 로직

원격 저장소의 파일 존재 여부를 사전에 스캔하여 결함 없는 커밋 상태를 유지하는 파일 전송 레이어를 구축합니다.

**파일명: `app/api/github-push/route.ts` 내부 일부**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function POST(req: NextRequest) {
  // 인증 및 세션 검증 생략 (토큰 취득 완료 가정)
  const { repo, owner, path, content, branch, accessToken } = await req.json();

  const octokit = new Octokit({ auth: accessToken });
  let currentSha: string | undefined = undefined;

  // 💡 Phase 1: 원격 저장소에 동일 경로의 파일이 이미 존재하는지 검사
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path.replace(/^\//, ""), // 경로 앞쪽의 슬래시 제거
      ref: branch,
    });

    // 💡 파일이 이미 존재한다면 해당 파일의 고유 SHA 값을 추출하여 수정 모드로 전환
    if (!Array.isArray(data) && data.type === "file") {
      currentSha = data.sha;
    }
  } catch (error: any) {
    // 💡 404 에러인 경우 파일이 존재하지 않는 것이므로 SHA 없이 신규 생성 모드로 진입
    if (error.status !== 404) {
      return NextResponse.json(
        { error: "원격 저장소 조회 실패" },
        { status: 500 },
      );
    }
  }

  // 💡 Phase 2: SHA 탑재 여부에 따른 조건부 파일 생성 및 업데이트(Create or Update)
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: path.replace(/^\//, ""),
      message: currentSha
        ? "🗂️ [Update] DevFlow 문서 편집본 동기화"
        : "🚀 [Create] DevFlow 새 문서 배포",
      content: Buffer.from(content).toString("base64"), // 💡 깃허브 API 규격에 맞춘 Base64 필수 인코딩
      branch,
      sha: currentSha, // 💡 undefined인 경우 신규 생성, 값이 있으면 덮어쓰기로 자동 처리됨
    });

    return NextResponse.json({ success: true });
  } catch (pushError: any) {
    return NextResponse.json({ error: pushError.message }, { status: 500 });
  }
}
```

## 3. 기술적 이점

- **멱등성(Idempotency) 확보**: 사용자가 `[GitHub로 푸시]` 버튼을 몇 번을 누르더라도 시스템이 알아서 원격지 해시를 대조하므로, 중복 파일 생성 오류나 커밋 충돌 없이 안전한 단일 정적 데이터 유지가 가능합니다.s
