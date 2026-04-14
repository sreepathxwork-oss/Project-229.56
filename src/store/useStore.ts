import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'Void' | 'Amber Forest' | 'Synthwave';
export type ColorblindMode = 'None' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia';

export interface TapData {
  number: number;
  time: number; // timestamp
  duration: number; // time since last tap
}

export interface SessionRecord {
  id: string;
  date: string;
  mode: string;
  size: number;
  time: number;
  accuracy: number;
  taps: TapData[];
}

interface UserState {
  level: string;
  totalSynapses: number;
  unlockedBadges: string[];
  theme: Theme;
  settings: {
    haptic: boolean;
    sound: boolean;
    colorblind: ColorblindMode;
  };
  stats: {
    dailyRuns: SessionRecord[];
    personalBests: Record<string, number>;
  };
  ghostData: TapData[] | null;

  // Actions
  addSession: (session: SessionRecord) => void;
  updateSettings: (settings: Partial<UserState['settings']>) => void;
  setTheme: (theme: Theme) => void;
  resetData: () => void;
}

const INITIAL_STATE = {
  level: 'Neural Initiate',
  totalSynapses: 0,
  unlockedBadges: [],
  theme: 'Void' as Theme,
  settings: {
    haptic: true,
    sound: true,
    colorblind: 'None' as ColorblindMode,
  },
  stats: {
    dailyRuns: [],
    personalBests: {},
  },
  ghostData: null,
};

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      addSession: (session) => set((state) => {
        const newTotalSynapses = state.totalSynapses + session.size * session.size;
        const newDailyRuns = [...state.stats.dailyRuns, session];
        
        // Update personal best
        const modeKey = `${session.mode}_${session.size}`;
        const currentBest = state.stats.personalBests[modeKey] || Infinity;
        const newPersonalBests = {
          ...state.stats.personalBests,
          [modeKey]: Math.min(currentBest, session.time),
        };

        // Level logic
        let newLevel = state.level;
        if (newTotalSynapses > 10000) newLevel = 'Synaptic Master';
        else if (newTotalSynapses > 5000) newLevel = 'Neural Architect';
        else if (newTotalSynapses > 1000) newLevel = 'Cognitive Voyager';

        // Badge logic (simplified)
        const newBadges = [...state.unlockedBadges];
        if (session.time < 20000 && session.size === 5 && !newBadges.includes('Sub-20s Club')) {
          newBadges.push('Sub-20s Club');
        }
        if (newTotalSynapses >= 1000 && !newBadges.includes('Synapse Collector')) {
          newBadges.push('Synapse Collector');
        }

        return {
          totalSynapses: newTotalSynapses,
          stats: {
            dailyRuns: newDailyRuns,
            personalBests: newPersonalBests,
          },
          level: newLevel,
          unlockedBadges: newBadges,
          ghostData: session.taps,
        };
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      setTheme: (theme) => set({ theme }),

      resetData: () => set(INITIAL_STATE),
    }),
    {
      name: 'neuroflare-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
