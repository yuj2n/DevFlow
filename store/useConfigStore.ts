import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
  selectedRepo: string;
  targetDir: string;
  extension: string;
  webhookUrl: string; // SettingsPage에서 사용하는 슬랙/디스코드 웹훅 상태
  theme: string; // SettingsPage에서 라이트/다크모드 제어용 상태
  namingPattern: "title_time" | "date_title" | "title_only";
  autoPush: boolean;
  branch: string;

  setSelectedRepo: (repo: string) => void;
  setTargetDir: (dir: string) => void;
  setExtension: (ext: string) => void;
  setNamingPattern: (
    pattern: "title_time" | "date_title" | "title_only",
  ) => void;

  // 깃허브 세부 속성 저장을 허용하는 확장형 세터 인스턴스 인터페이스 대응
  setGithubConfig: (config: {
    selectedRepo?: string;
    targetDir?: string;
    webhookUrl?: string;
    theme?: string;
    autoPush?: boolean;
    branch?: string;
    extension?: string;
  }) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      selectedRepo: "",
      targetDir: "",
      extension: ".md",
      webhookUrl: "",
      theme: "light",
      namingPattern: "title_time",
      autoPush: false,
      branch: "main",

      setSelectedRepo: (repo) => set({ selectedRepo: repo }),
      setTargetDir: (dir) => set({ targetDir: dir }),
      setExtension: (ext) => set({ extension: ext }),
      setNamingPattern: (pattern) => set({ namingPattern: pattern }),

      setGithubConfig: (config) =>
        set((state) => ({
          ...state,
          selectedRepo:
            config.selectedRepo !== undefined
              ? config.selectedRepo
              : state.selectedRepo,
          targetDir:
            config.targetDir !== undefined ? config.targetDir : state.targetDir,
          webhookUrl:
            config.webhookUrl !== undefined
              ? config.webhookUrl
              : state.webhookUrl,
          theme: config.theme !== undefined ? config.theme : state.theme,
          autoPush:
            config.autoPush !== undefined ? config.autoPush : state.autoPush,
          branch: config.branch !== undefined ? config.branch : state.branch,
          extension:
            config.extension !== undefined ? config.extension : state.extension,
        })),
    }),
    { name: "devflow-config-storage" }, // 로컬스토리지 영속화 키 레이블
  ),
);
