'use client';

import { useEffect, useCallback } from 'react';
import { Channel } from '@/types/channel';
import { useStore } from '@/store/useStore';

interface UseKeyboardOptions {
  filteredChannels: Channel[];
}

export function useKeyboard({ filteredChannels }: UseKeyboardOptions) {
  const {
    currentChannel,
    setCurrentChannel,
    toggleSearch,
    toggleMiniPlayer,
    toggleFavorite,
    isSearchOpen,
  } = useStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts when search is open (SearchBar handles its own)
      if (isSearchOpen) return;

      // Don't handle shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K: Open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
        return;
      }

      // Arrow Up/Down: Navigate channels
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredChannels.length === 0) return;

        const currentIndex = currentChannel
          ? filteredChannels.findIndex((ch) => ch.id === currentChannel.id)
          : -1;

        let nextIndex: number;
        if (e.key === 'ArrowUp') {
          nextIndex =
            currentIndex <= 0
              ? filteredChannels.length - 1
              : currentIndex - 1;
        } else {
          nextIndex =
            currentIndex >= filteredChannels.length - 1
              ? 0
              : currentIndex + 1;
        }

        setCurrentChannel(filteredChannels[nextIndex]);
        return;
      }

      // 1-9: Quick select channel
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < filteredChannels.length) {
          e.preventDefault();
          setCurrentChannel(filteredChannels[index]);
        }
        return;
      }

      // F: Toggle fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        return;
      }

      // S: Toggle favorite
      if ((e.key === 's' || e.key === 'S') && currentChannel) {
        e.preventDefault();
        toggleFavorite(currentChannel.id);
        return;
      }

      // P: Toggle mini player
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggleMiniPlayer();
        return;
      }
    },
    [
      currentChannel,
      filteredChannels,
      isSearchOpen,
      setCurrentChannel,
      toggleFavorite,
      toggleMiniPlayer,
      toggleSearch,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
