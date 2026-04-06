// Zustand store for watch history, favorites, continue watching
import { create } from "zustand";

export interface WatchEntry {
  id: number;
  type: "anime" | "movie" | "series";
  title: string;
  poster: string;
  progress?: number; // seconds
  episode?: number;
  season?: number;
  lastWatched: number; // unix timestamp
}

export interface FavoriteEntry {
  id: number;
  type: "anime" | "movie" | "series";
  title: string;
  poster: string;
  addedAt: number;
}

interface StoreState {
  watchHistory: WatchEntry[];
  favorites: FavoriteEntry[];
  addToHistory: (entry: Omit<WatchEntry, "lastWatched">) => void;
  removeFromHistory: (id: number, type: string) => void;
  clearHistory: () => void;
  addFavorite: (entry: Omit<FavoriteEntry, "addedAt">) => void;
  removeFavorite: (id: number, type: string) => void;
  isFavorite: (id: number, type: string) => boolean;
  getContinueWatching: () => WatchEntry[];
}

function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const useStore = create<StoreState>((set, get) => ({
  watchHistory: loadState<WatchEntry[]>("watch_history", []),
  favorites: loadState<FavoriteEntry[]>("favorites", []),

  addToHistory: (entry) => {
    set((state) => {
      const filtered = state.watchHistory.filter(
        (e) => !(e.id === entry.id && e.type === entry.type)
      );
      const next = [{ ...entry, lastWatched: Date.now() }, ...filtered].slice(0, 50);
      saveState("watch_history", next);
      return { watchHistory: next };
    });
  },

  removeFromHistory: (id, type) => {
    set((state) => {
      const next = state.watchHistory.filter((e) => !(e.id === id && e.type === type));
      saveState("watch_history", next);
      return { watchHistory: next };
    });
  },

  clearHistory: () => {
    saveState("watch_history", []);
    set({ watchHistory: [] });
  },

  addFavorite: (entry) => {
    set((state) => {
      const exists = state.favorites.some((f) => f.id === entry.id && f.type === entry.type);
      if (exists) return state;
      const next = [{ ...entry, addedAt: Date.now() }, ...state.favorites];
      saveState("favorites", next);
      return { favorites: next };
    });
  },

  removeFavorite: (id, type) => {
    set((state) => {
      const next = state.favorites.filter((f) => !(f.id === id && f.type === type));
      saveState("favorites", next);
      return { favorites: next };
    });
  },

  isFavorite: (id, type) => {
    return get().favorites.some((f) => f.id === id && f.type === type);
  },

  getContinueWatching: () => {
    return get()
      .watchHistory.filter((e) => e.progress && e.progress > 30)
      .slice(0, 12);
  },
}));
