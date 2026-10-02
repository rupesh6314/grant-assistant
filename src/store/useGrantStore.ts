import { create } from "zustand";
import { AppState } from "@/types";

export const useGrantStore = create<AppState>((set) => ({
  guideline: { content: "", version: 1, lastUpdated: new Date() },
  application: { content: "", version: 1, lastUpdated: new Date() },
  mappings: [],
  clarifications: [],
  isStale: false,
  isProcessing: false,

  updateGuideline: (content) =>
    set((state) => ({
      guideline: {
        content,
        version:
          state.guideline.content === content
            ? state.guideline.version
            : state.guideline.version + 1,
        lastUpdated: new Date(),
      },
      isStale: state.guideline.content !== content ? true : state.isStale,
    })),

  updateApplication: (content) =>
    set((state) => ({
      application: {
        content,
        version:
          state.application.content === content
            ? state.application.version
            : state.application.version + 1,
        lastUpdated: new Date(),
      },
      isStale: state.application.content !== content ? true : state.isStale,
    })),

  setAnalysisResults: (mappings, clarifications) =>
    set({ mappings, clarifications, isStale: false, isProcessing: false }),

  updateMappingStatus: (id, status, notes) =>
    set((state) => ({
      mappings: state.mappings.map((m) =>
        m.id === id ? { ...m, status, userNotes: notes || m.userNotes } : m
      ),
    })),

  resetStale: () => set({ isStale: false }),
}));