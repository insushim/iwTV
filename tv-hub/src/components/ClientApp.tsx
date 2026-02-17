'use client';

import { useEffect } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { useStore } from '@/store/useStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { channels } from '@/data/channels';
import { filterChannels } from '@/utils/channelUtils';
import Header from './Header';
import ChannelSidebar from './ChannelSidebar';
import VideoPlayer from './VideoPlayer';
import MiniGuide from './MiniGuide';
import SearchBar from './SearchBar';
import Footer from './Footer';

function AppContent() {
  const {
    selectedCategory,
    favorites,
    searchQuery,
    theme,
    isSidebarOpen,
    isMiniPlayer,
    currentChannel,
  } = useStore();

  const filteredChannels = filterChannels(
    channels,
    selectedCategory,
    favorites,
    searchQuery
  );

  useKeyboard({ filteredChannels });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-container" data-theme={theme}>
      <Header />
      <SearchBar />

      <div className="app-body">
        <ChannelSidebar />

        <main
          className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''} ${
            isMiniPlayer && currentChannel ? 'has-mini-player' : ''
          }`}
        >
          <VideoPlayer />
          {currentChannel && !isMiniPlayer && <MiniGuide />}
          <Footer />
        </main>
      </div>

      {isMiniPlayer && currentChannel && (
        <div className="mini-player-container">
          <VideoPlayer />
        </div>
      )}
    </div>
  );
}

export default function ClientApp() {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="loading-splash">
        <div className="loading-splash-content">
          <div className="loading-splash-logo">
            <div className="loading-splash-icon">
              <span className="loading-splash-on">ON</span>
              <span className="loading-splash-dot" />
            </div>
            <h1 className="loading-splash-title">온에어</h1>
          </div>
          <p className="loading-splash-subtitle">모든 채널, 한 화면에</p>
          <div className="loading-splash-spinner" />
        </div>
      </div>
    );
  }

  return <AppContent />;
}
