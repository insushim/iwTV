'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { channels } from '@/data/channels';
import { filterChannels } from '@/utils/channelUtils';
import { CATEGORIES } from '@/types/channel';
import ChannelLogo from './ChannelLogo';

export default function SearchBar() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setCurrentChannel,
    favorites,
  } = useStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);

  const results = filterChannels(channels, 'all', favorites, query);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && !prevOpenRef.current) {
      // Reset state when opening
      setQuery('');
      setSelectedIndex(0);
      // Focus on next tick
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = isSearchOpen;
  }, [isSearchOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.search-result-item');
    const selectedItem = items[selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Reset selected index when query changes
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, [setIsSearchOpen]);

  const selectChannel = useCallback(
    (index: number) => {
      if (index >= 0 && index < results.length) {
        setCurrentChannel(results[index]);
        closeSearch();
      }
    },
    [results, setCurrentChannel, closeSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          selectChannel(selectedIndex);
          break;
        case 'Escape':
          e.preventDefault();
          closeSearch();
          break;
      }
    },
    [results.length, selectedIndex, selectChannel, closeSearch]
  );

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isSearchOpen) {
          closeSearch();
        } else {
          setIsSearchOpen(true);
        }
      }
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSearchOpen, closeSearch, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const getCategoryName = (categoryId: string): string => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat?.name || categoryId;
  };

  const getCategoryColor = (categoryId: string): string => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat?.color || 'gray';
  };

  return (
    <div className="search-overlay" onClick={closeSearch}>
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="채널 검색... (이름, 번호, 설명)"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              className="search-clear-btn"
              onClick={() => handleQueryChange('')}
              aria-label="검색어 지우기"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="search-results" ref={listRef}>
          {results.length === 0 ? (
            <div className="search-no-results">
              <p>검색 결과가 없습니다.</p>
              {query && <p className="search-no-results-hint">&ldquo;{query}&rdquo;에 해당하는 채널이 없습니다.</p>}
            </div>
          ) : (
            results.map((channel, index) => (
              <div
                key={channel.id}
                className={`search-result-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => selectChannel(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="search-result-logo">
                  <ChannelLogo
                    channelId={channel.id}
                    name={channel.name}
                    officialUrl={channel.officialUrl}
                    size="sm"
                  />
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">{channel.name}</div>
                  <div className="search-result-desc">{channel.description}</div>
                </div>
                <div className="search-result-meta">
                  <span
                    className={`search-result-category category-badge-${getCategoryColor(
                      channel.category
                    )}`}
                  >
                    {getCategoryName(channel.category)}
                  </span>
                  {channel.channelNumber !== undefined && (
                    <span className="search-result-ch">
                      CH {channel.channelNumber}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="search-footer">
          <div className="search-footer-hints">
            <span>
              <kbd>↑</kbd><kbd>↓</kbd> 이동
            </span>
            <span>
              <kbd>Enter</kbd> 선택
            </span>
            <span>
              <kbd>Esc</kbd> 닫기
            </span>
          </div>
          <div className="search-footer-count">
            {results.length}개 채널
          </div>
        </div>
      </div>
    </div>
  );
}
