'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Channel, ChannelCategory } from '@/types/channel';

type SelectedCategory = ChannelCategory | 'favorites' | 'all';

interface AppState {
  // Player state
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel | null) => void;

  // Category filter
  selectedCategory: SelectedCategory;
  setSelectedCategory: (category: SelectedCategory) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;

  // Sidebar
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Mini player
  isMiniPlayer: boolean;
  setIsMiniPlayer: (mini: boolean) => void;
  toggleMiniPlayer: () => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;

  // Recent channels
  recentChannels: string[];
  addRecentChannel: (channelId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Player state
      currentChannel: null,
      setCurrentChannel: (channel) => {
        set({ currentChannel: channel });
        if (channel) {
          get().addRecentChannel(channel.id);
        }
      },

      // Category filter
      selectedCategory: 'all',
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      isSearchOpen: false,
      setIsSearchOpen: (open) => set({ isSearchOpen: open }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      // Sidebar
      isSidebarOpen: true,
      setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Mini player
      isMiniPlayer: false,
      setIsMiniPlayer: (mini) => set({ isMiniPlayer: mini }),
      toggleMiniPlayer: () => set((state) => ({ isMiniPlayer: !state.isMiniPlayer })),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      // Favorites
      favorites: [],
      toggleFavorite: (channelId) =>
        set((state) => ({
          favorites: state.favorites.includes(channelId)
            ? state.favorites.filter((id) => id !== channelId)
            : [...state.favorites, channelId],
        })),
      isFavorite: (channelId) => get().favorites.includes(channelId),

      // Recent channels
      recentChannels: [],
      addRecentChannel: (channelId) =>
        set((state) => {
          const filtered = state.recentChannels.filter((id) => id !== channelId);
          return {
            recentChannels: [channelId, ...filtered].slice(0, 20),
          };
        }),
    }),
    {
      name: 'onair-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        favorites: state.favorites,
        recentChannels: state.recentChannels,
        theme: state.theme,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState> | undefined;
        return {
          ...currentState,
          favorites: persisted?.favorites ?? [],
          recentChannels: persisted?.recentChannels ?? [],
          theme: persisted?.theme ?? 'dark',
        };
      },
    }
  )
);
