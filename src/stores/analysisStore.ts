import { create } from "zustand";
import type { CodeScopeAnalysis } from "../types";

interface AnalysisState {
  recentAnalysis: CodeScopeAnalysis[];
  activeAnalysis: CodeScopeAnalysis | null;
  setActiveAnalysis: (analysis: CodeScopeAnalysis | null) => void;
  addRecentAnalysis: (analysis: CodeScopeAnalysis) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  recentAnalysis: [],
  activeAnalysis: null,
  setActiveAnalysis: (activeAnalysis) => set({ activeAnalysis }),
  addRecentAnalysis: (analysis) =>
    set((state) => ({
      activeAnalysis: analysis,
      recentAnalysis: [
        analysis,
        ...state.recentAnalysis.filter((item) => item.projectName !== analysis.projectName),
      ].slice(0, 8),
    })),
}));
