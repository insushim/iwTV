'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ExternalLink as ExternalLinkIcon, RefreshCw, Play } from 'lucide-react';
import { Channel } from '@/types/channel';

interface YouTubePlayerProps {
  channel: Channel;
}

export default function YouTubePlayer({ channel }: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${channel.youtubeChannelId}&autoplay=1&mute=0&rel=0&modestbranding=1`;
  const youtubeDirectUrl = `https://www.youtube.com/channel/${channel.youtubeChannelId}/live`;

  useEffect(() => {
    setIsLoading(true);
    setShowFallback(false);

    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setShowFallback(true);
      }
    }, 8000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.youtubeChannelId, retryKey]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleRetry = useCallback(() => {
    setShowFallback(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  }, []);

  return (
    <div className="video-player-youtube">
      {isLoading && !showFallback && (
        <div className="video-player-skeleton">
          <div className="video-player-skeleton-pulse" />
          <div className="video-player-skeleton-text">
            {channel.name} 로딩 중...
          </div>
        </div>
      )}

      {showFallback && (
        <div className="video-player-error">
          <div className="video-player-error-content">
            <div className="video-player-error-icon">📡</div>
            <h3>라이브 스트림에 연결 중...</h3>
            <p>임베드가 지원되지 않거나 현재 방송 중이 아닐 수 있습니다.</p>
            <div className="video-player-error-actions">
              <a
                href={youtubeDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-player-youtube-btn"
              >
                <Play size={16} />
                YouTube에서 시청하기
              </a>
              <button className="video-player-retry-btn" onClick={handleRetry}>
                <RefreshCw size={16} />
                다시 시도
              </button>
              {channel.officialUrl && (
                <a
                  href={channel.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-player-official-link"
                >
                  <ExternalLinkIcon size={16} />
                  공식 사이트
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <iframe
        key={`${channel.youtubeChannelId}-${retryKey}`}
        src={embedUrl}
        title={`${channel.name} 라이브 스트림`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="video-player-iframe"
        onLoad={handleLoad}
        style={{
          opacity: showFallback ? 0 : isLoading ? 0 : 1,
          position: showFallback ? 'absolute' : 'relative',
          pointerEvents: showFallback ? 'none' : 'auto',
        }}
      />

      {!isLoading && !showFallback && (
        <div className="video-player-youtube-direct">
          <a
            href={youtubeDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="video-player-yt-link"
          >
            YouTube에서 열기 ↗
          </a>
        </div>
      )}
    </div>
  );
}
