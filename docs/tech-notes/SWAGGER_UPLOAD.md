# [기술 가이드] HTML5 Drag & Drop API 및 FileReader를 활용한 비동기 JSON 로컬 파싱

본 문서는 프로젝트 **DevFlow**의 Swagger 공유 페이지에 적용된 로컬 파일 드래그 앤 드롭(Drag & Drop) 인터페이스 구현과 `FileReader` 스트림을 활용한 무결성 JSON 데이터 디코딩 기술 가이드입니다.

## 1. 개요

사용자가 외부 Swagger 명세 파일을 서비스에 등록할 때, 매번 탐색기를 열어 파일을 선택하는 번거로운 워크플로우를 개선하고자 브라우저 표준 **Drag & Drop API**를 활용한 고급 UX 레이아웃을 제공합니다. 또한, 서버로 파일을 전송해 파싱하는 오버헤드를 줄이기 위해 브라우저 샌드박스 내부에서 안전하게 읽어내는 **`FileReader` 비동기 스트림 아키텍처**를 구축합니다.

---

## 2. 주요 설정 단계

### 2.1 Drag & Drop 이벤트 바인딩 및 UX 활성화 상태 제어

드래그 오버(`dragover`), 드래그 리브(`dragleave`), 드롭(`drop`) 이벤트를 정밀 제어하여 사용자의 액션에 따라 시각적 피드백을 동적으로 제공하는 드롭존(Dropzone) 컨테이너를 구현합니다.

**파일명: `components/Swagger/SwaggerImport.tsx` 일부**

```tsx
"use client";

import { useState } from "react";

export default function SwaggerImport() {
  // 드래그가 활성화(컨테이너 위로 진입) 되었는지 관리하는 상태
  const [isDragActive, setIsDragActive] = useState(false);

  // 드래그 진입 및 오버 시 브라우저 기본 전송 동작 차단 및 하이라이팅 활성화
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false); // 드롭 완료 시 하이라이팅 해제

    // 드롭된 파일 래퍼 객체 추출 후 처리 핸들러로 이송
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 transition-all ${
        isDragActive
          ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
          : "border-slate-200 bg-white"
      }`}
    >
      <h3 className="font-bold">JSON 파일 업로드</h3>
      <p>파일을 여기로 드래그하거나 클릭하세요.</p>
    </div>
  );
}
```

---

### 2.2 FileReader 기반 클라이언트 사이드 비동기 스트림 파싱

업로드되거나 드롭된 파일의 마임 타입(Mime Type)을 검증하고, 백엔드 서버 개입 없이 브라우저 단에서 텍스트 스트림으로 전환하여 메모리에 적재하는 안전한 로컬 파싱 헬퍼를 연동합니다.

```typescript
const handleFile = (file: File) => {
  if (!file) return;

  // 안전 장치 1: JSON 파일 확장자 및 MIME 타입 정적 검증
  if (file.type !== "application/json" && !file.name.endsWith(".json")) {
    alert("JSON 형식의 파일만 업로드 가능합니다.");
    return;
  }

  // 안전 장치 2: FileReader 인스턴스를 통한 비동기 파일 읽기 스트림 가동
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      // 문자열 결과물을 명시적 타입 단언(as string) 후 Swagger 규격으로 캐스팅
      const json = JSON.parse(e.target?.result as string) as SwaggerData;

      // Zustand 스토어 및 에디터 뼈대 주입 함수 실행
      processSwaggerJson(json);
    } catch (err) {
      alert("유효한 JSON 파일이 아닙니다.");
    }
  };

  // 텍스트 포맷으로 스트림 읽기 시작 트리거
  reader.readAsText(file);
};
```

---

## 3. 주의사항 및 기술적 이점

- **이벤트 전파 차단(`stopPropagation`)**: `e.stopPropagation()`을 누락할 경우 브라우저가 파일 데이터를 텍스트로 인식하지 못하고 페이지 전체가 해당 JSON 파일 창으로 리다이렉트되거나 강제 다운로드되는 현상이 발생하므로 반드시 이벤트 캡처링/버블링을 차단해야 합니다.
- **클라이언트 전용 연산**: 파일 업로드 연산은 100% 사용자의 로컬 환경 메모리 스페이스 내에서 이루어지므로 대용량 API 명세서를 파싱할 때 백엔드 네트워크 **트래픽 대역폭(Bandwidth) 리소스를 0MB로 완벽 통제**하는 고성능 클라이언트 사이드 컴퓨팅 환경을 보장합니다.
