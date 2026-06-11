import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
  selectedRepo: string;
  targetDir: string;
  extension: string;
  webhookUrl: string; // SettingsPage에서 사용하는 슬랙/디스코드 웹훅 상태
  theme: string; // SettingsPage에서 라이트/다크모드 제어용 상태
  namingPattern: "title_time" | "date_title" | "title_only";

  setSelectedRepo: (repo: string) => void;
  setTargetDir: (dir: string) => void;
  setExtension: (ext: string) => void;
  setNamingPattern: (
    pattern: "title_time" | "date_title" | "title_only",
  ) => void;

  // SettingsPage에서 '설정 저장' 버튼을 누를 때 웹훅과 테마를 통째로 넘겨받는 마스터 세터
  setGithubConfig: (config: { webhookUrl: string; theme: string }) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      selectedRepo: "",
      targetDir: "",
      extension: ".md",
      webhookUrl: "", // 초기값
      theme: "light", // 초기값
      namingPattern: "title_time", // 기본 컨벤션 규칙값

      setSelectedRepo: (repo) => set({ selectedRepo: repo }),
      setTargetDir: (dir) => set({ targetDir: dir }),
      setExtension: (ext) => set({ extension: ext }),
      setNamingPattern: (pattern) => set({ namingPattern: pattern }),

      // 기존 환경 설정의 데이터가 증발하지 않고 그대로 덮어쓰여 보존되도록 브릿지 바인딩
      setGithubConfig: (config) =>
        set((state) => ({
          ...state,
          webhookUrl: config.webhookUrl,
          theme: config.theme,
        })),
    }),
    { name: "devflow-config-storage" }, // 로컬스토리지 키 레이블
  ),
);
