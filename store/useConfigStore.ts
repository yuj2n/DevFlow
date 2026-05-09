import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GithubConfig {
  selectedRepo: string;
  targetDir: string;
  autoPush: boolean;
  setGithubConfig: (config: Partial<GithubConfig>) => void;
}

export const useConfigStore = create<GithubConfig>()(
  persist(
    (set) => ({
      selectedRepo: "",
      targetDir: "/docs/api-specs",
      autoPush: true,
      setGithubConfig: (config) => set((state) => ({ ...state, ...config })),
    }),
    { name: "github-config-storage" }, // 로컬 스토리지에 저장되어 새로고침해도 유지됨
  ),
);
