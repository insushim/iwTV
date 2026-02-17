'use client';

import { Search, Star, Sun, Moon, Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Header() {
  const {
    theme,
    toggleTheme,
    toggleSearch,
    setSelectedCategory,
    selectedCategory,
    toggleSidebar,
  } = useStore();

  const handleFavoritesClick = () => {
    setSelectedCategory(selectedCategory === 'favorites' ? 'all' : 'favorites');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <button
            className="header-menu-btn"
            onClick={toggleSidebar}
            aria-label="사이드바 토글"
          >
            <Menu size={20} />
          </button>
          <div className="header-logo" onClick={() => setSelectedCategory('all')}>
            <div className="header-logo-icon">
              <span className="header-logo-icon-text">ON</span>
              <span className="header-logo-live-dot" />
            </div>
            <h1 className="header-title">온에어</h1>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="header-action-btn"
            onClick={toggleSearch}
            aria-label="검색 열기 (Ctrl+K)"
            title="검색 (Ctrl+K)"
          >
            <Search size={18} />
            <span className="header-action-label">검색</span>
            <kbd className="header-kbd">Ctrl+K</kbd>
          </button>

          <button
            className={`header-action-btn ${
              selectedCategory === 'favorites' ? 'active' : ''
            }`}
            onClick={handleFavoritesClick}
            aria-label="즐겨찾기"
            title="즐겨찾기"
          >
            <Star
              size={18}
              fill={selectedCategory === 'favorites' ? 'currentColor' : 'none'}
            />
            <span className="header-action-label">즐겨찾기</span>
          </button>

          <button
            className="header-action-btn theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드' : '다크 모드'}
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
