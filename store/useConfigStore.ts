import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GithubConfig {
  // 깃허브 연동 관련
  selectedRepo: string;
  targetDir: string;
  autoPush: boolean;
  branch: string;
  extension: string;

  // 협업 및 배포 관련
  deployUrl: string;
  webhookUrl: string;

  // 서비스 환경 관련
  theme: "light" | "dark";
  template: string;

  // 설정 업데이트
  setGithubConfig: (config: Partial<GithubConfig>) => void;
}

export const useConfigStore = create<GithubConfig>()(
  persist(
    (set) => ({
      // 초기값 설정
      selectedRepo: "",
      targetDir: "/docs/api-specs",
      autoPush: true,
      branch: "main",
      extension: ".md",

      // 추가된 필드 초기화
      deployUrl: "",
      webhookUrl: "",
      theme: "light",
      template: "standard",
      setGithubConfig: (config) => set((state) => ({ ...state, ...config })),
    }),
    {
      name: "github-config-storage", // 로컬 스토리지 키 이름
    },
  ),
);
