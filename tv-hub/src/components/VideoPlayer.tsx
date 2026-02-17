'use client';

import {
  ExternalLink as ExternalLinkIcon,
  Minimize2,
  Maximize2,
  Star,
  Keyboard,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import YouTubePlayer from './YouTubePlayer';
import HlsPlayer from './HlsPlayer';
import ExternalLink from './ExternalLink';

export default function VideoPlayer() {
  const {
    currentChannel,
    isMiniPlayer,
    toggleMiniPlayer,
    favorites,
    toggleFavorite,
  } = useStore();

  // Empty state
  if (!currentChannel) {
    return (
      <div className="video-player-empty">
        <div className="video-player-empty-content">
          <div className="video-player-empty-icon">📺</div>
          <h2>채널을 선택하세요</h2>
          <p>왼쪽 목록에서 시청할 채널을 선택하거나 검색하세요.</p>
          <div className="video-player-shortcuts">
            <div className="shortcut-title">
              <Keyboard size={16} />
              키보드 단축키
            </div>
            <div className="shortcut-grid">
              <div className="shortcut-item">
                <kbd>↑</kbd><kbd>↓</kbd>
                <span>채널 이동</span>
              </div>
              <div className="shortcut-item">
                <kbd>1</kbd>~<kbd>9</kbd>
                <span>빠른 선택</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd>+<kbd>K</kbd>
                <span>검색</span>
              </div>
              <div className="shortcut-item">
                <kbd>F</kbd>
                <span>전체화면</span>
              </div>
              <div className="shortcut-item">
                <kbd>S</kbd>
                <span>즐겨찾기</span>
              </div>
              <div className="shortcut-item">
                <kbd>P</kbd>
                <span>미니 플레이어</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(currentChannel.id);

  const renderPlayer = () => {
    switch (currentChannel.type) {
      case 'youtube':
        return <YouTubePlayer channel={currentChannel} />;
      case 'hls':
        return <HlsPlayer channel={currentChannel} />;
      case 'external':
        return <ExternalLink channel={currentChannel} />;
      default:
        return null;
    }
  };

  const playerContent = (
    <>
      <div className="video-player-content">{renderPlayer()}</div>
      <div className="video-player-info-bar">
        <div className="video-player-info-left">
          <h3 className="video-player-channel-name">{currentChannel.name}</h3>
          {currentChannel.channelNumber !== undefined && (
            <span className="video-player-channel-num">
              CH {currentChannel.channelNumber}
            </span>
          )}
          {currentChannel.type === 'youtube' && (
            <span className="live-badge live-badge-sm">LIVE</span>
          )}
        </div>
        <div className="video-player-info-right">
          {currentChannel.officialUrl && (
            <a
              href={currentChannel.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="video-player-info-btn"
              title="공식 사이트"
            >
              <ExternalLinkIcon size={16} />
            </a>
          )}
          <button
            className="video-player-info-btn"
            onClick={toggleMiniPlayer}
            title={isMiniPlayer ? '일반 크기' : '미니 플레이어'}
          >
            {isMiniPlayer ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            className={`video-player-info-btn fav-btn ${isFav ? 'active' : ''}`}
            onClick={() => toggleFavorite(currentChannel.id)}
            title={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </>
  );

  if (isMiniPlayer) {
    return <div className="mini-player">{playerContent}</div>;
  }

  return <div className="video-player">{playerContent}</div>;
}
