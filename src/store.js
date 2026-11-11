import { create } from 'zustand';
export const useAppStore = create((set) => ({
  explosion: 0, selectedPart: null, activeLayer: 'All systems', drs: false, airflow: false, lowQuality: false, theme: 'dark',
  setExplosion: (explosion) => set({ explosion }), setSelectedPart: (selectedPart) => set({ selectedPart }),
  setLayer: (activeLayer) => set({ activeLayer }), toggle: (key) => set((s) => ({ [key]: !s[key] }))
}));