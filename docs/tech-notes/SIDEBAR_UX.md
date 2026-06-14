# [기술 가이드] usePathname을 활용한 Active Tab 강조 UI 구현

사용자가 현재 머물고 있는 메뉴를 시각적으로 명확히 인지할 수 있도록 돕는 **Active Tab 상태 관리** 및 **조건부 스타일링** 구현 가이드입니다.

## 1. 구현 원리

Next.js의 클라이언트 사이드 네비게이션 훅인 `usePathname`을 사용하여 현재 브라우저의 경로(URL)를 감지하고, 이를 메뉴 아이템의 목적지 주소와 비교하여 활성화 상태를 결정합니다.

## 2. 주요 코드 구현

### 2.1 현재 경로 감지

링크: https://github.com/yuj2n/DevFlow/blob/main/components/Navigation/SideTabBar.tsx

`next/navigation` 모듈에서 제공하는 `usePathname` 훅을 사용합니다. 이 훅은 반드시 `"use client"` 지시어가 포함된 컴포넌트에서만 동작합니다.

```tsx
"use client";
import { usePathname } from "next/navigation";

export default function SideTabBar() {
  const pathname = usePathname(); // 현재 경로 (예: /swagger)
  // ...
}
```

### 2.2 조건부 스타일링 (Tailwind CSS)

현재 경로와 메뉴의 링크 주소가 일치할 경우(Active), 시인성이 높은 스타일을 적용합니다.

**NavItem 컴포넌트 예시:**

```tsx
function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <div
      className={`
      flex items-center p-2 rounded-xl transition-all
      ${
        active
          ? "bg-blue-600/20 text-blue-400" // 활성화 시: 배경 강조 및 텍스트 색상 변경
          : "text-slate-400 hover:bg-slate-800" // 비활성화 시: 호버 효과만 적용
      }
    `}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </div>
  );
}
```

## 3. UX 개선 포인트

- **시각적 일관성**: 메뉴 클릭 시 즉각적인 스타일 변경을 통해 사용자에게 현재 페이지 위치에 대한 실시간 피드백을 제공합니다.
- **접근성**: 텍스트 색상뿐만 아니라 배경색의 투명도 변화를 함께 주어 저시력자도 활성화된 탭을 쉽게 구분할 수 있도록 설계하였습니다.
- **반응형 디자인**: 사이드바가 접혔을 때(`isExpanded: false`)도 아이콘의 색상 변화를 통해 활성 상태를 유지하여 최소한의 공간에서도 정보를 전달합니다.

## 4. 적용 결과

본 프로젝트에서는 `/documents`, `/swagger`, `/github`, `/settings` 등 주요 라우트 이동 시 사이드바 메뉴가 동적으로 강조되도록 구현 완료되었습니다.

### 5. Best Practice: 외부 라이브러리 인스턴스 관리

Tiptap, Chart.js 등 내부 상태를 직접 관리하는 외부 라이브러리를 리액트에서 사용할 때는, 데이터(ID)가 바뀔 때 key 프롭을 함께 변경하여 인스턴스를 새로 고침하세요. 이것이 수동으로 데이터를 하나하나 동기화하는 것보다 훨씬 안전하고 간결한 방법입니다.
