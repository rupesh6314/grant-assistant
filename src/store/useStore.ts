import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppState } from "@/types";

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      assessments: [],
      documents: [],
      templates: [],
      currentId: null,

      preferences: {
        name: "Rupesh",
        email: "rupesh@example.com",
        organization: "University of Washington",
        theme: "light",
        density: "comfortable",
        notifyEmail: true,
        notifyAnalysis: true,
        notifyStale: true,
      },

      addAssessment: (a) =>
        set((s) => ({ assessments: [a, ...s.assessments] })),
      updateAssessment: (id, patch) =>
        set((s) => ({
          assessments: s.assessments.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        })),
      deleteAssessment: (id) =>
        set((s) => ({
          assessments: s.assessments.filter((a) => a.id !== id),
          currentId: s.currentId === id ? null : s.currentId,
        })),
      setCurrent: (id) => set({ currentId: id }),

      addDocument: (d) =>
        set((s) => ({ documents: [d, ...s.documents] })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d
          ),
        })),
      deleteDocument: (id) =>
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== id),
        })),

      addTemplate: (t) =>
        set((s) => ({ templates: [t, ...s.templates] })),
      updateTemplate: (id, patch) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id
              ? { ...t, ...patch, updatedAt: new Date().toISOString() }
              : t
          ),
        })),
      deleteTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),
      incrementTemplateUsage: (id) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
          ),
        })),

      updatePreferences: (patch) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch } })),
    }),
    {
      name: "grant-assistant-store",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      migrate: (persistedState: any, version: number) => {
        if (version !== 4) return undefined as any;
        return persistedState;
      },
    }
  )
);

export const rehydrateStore = () => {
  if (typeof window !== "undefined") {
    useStore.persist.rehydrate();
  }
};