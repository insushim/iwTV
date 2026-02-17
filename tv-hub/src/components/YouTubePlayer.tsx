'use client';

import { useState, useCallback } from 'react';
import { ExternalLink as ExternalLinkIcon, RefreshCw } from 'lucide-react';
import { Channel } from '@/types/channel';

interface YouTubePlayerProps {
  channel: Channel;
}

export default function YouTubePlayer({ channel }: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${channel.youtubeChannelId}&autoplay=1&mute=0`;

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  }, []);

  if (hasError) {
    return (
      <div className="video-player-error">
        <div className="video-player-error-content">
          <div className="video-player-error-icon">📡</div>
          <h3>라이브 스트림을 불러올 수 없습니다</h3>
          <p>{channel.name}의 실시간 방송이 현재 진행되지 않거나 접근할 수 없습니다.</p>
          <div className="video-player-error-actions">
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
                공식 사이트에서 시청
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-youtube">
      {isLoading && (
        <div className="video-player-skeleton">
          <div className="video-player-skeleton-pulse" />
          <div className="video-player-skeleton-text">
            {channel.name} 로딩 중...
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
        onError={handleError}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
}
