'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ExternalLink as ExternalLinkIcon, RefreshCw, Play, Loader2 } from 'lucide-react';
import { Channel } from '@/types/channel';

interface YouTubePlayerProps {
  channel: Channel;
}

export default function YouTubePlayer({ channel }: YouTubePlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const youtubeDirectUrl = `https://www.youtube.com/channel/${channel.youtubeChannelId}/live`;

  // Fetch actual live video ID from our API
  useEffect(() => {
    setIsResolving(true);
    setIsLoading(true);
    setError(null);
    setVideoId(null);

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const fetchVideoId = async () => {
      try {
        const res = await fetch(`/api/live/${channel.youtubeChannelId}`, {
          signal: abortRef.current!.signal,
        });

        if (res.ok) {
          const data = await res.json();
          setVideoId(data.videoId);
          setIsResolving(false);
        } else {
          // API couldn't find a live stream - fall back to live_stream embed
          setVideoId(null);
          setIsResolving(false);
          setError('no-live');
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setVideoId(null);
        setIsResolving(false);
        setError('fetch-error');
      }
    };

    fetchVideoId();

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [channel.youtubeChannelId, retryKey]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setIsResolving(true);
    setRetryKey((prev) => prev + 1);
  }, []);

  // Build embed URL based on resolved video ID
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1&vq=hd1080&hd=1`
    : null;

  return (
    <div className="video-player-youtube">
      {/* Resolving state - fetching video ID */}
      {isResolving && (
        <div className="video-player-skeleton">
          <div className="video-player-skeleton-pulse" />
          <div className="video-player-skeleton-text">
            <Loader2 size={20} className="video-player-spinner" />
            {channel.name} 라이브 스트림 연결 중...
          </div>
        </div>
      )}

      {/* Loading iframe after we have video ID */}
      {!isResolving && embedUrl && isLoading && (
        <div className="video-player-skeleton">
          <div className="video-player-skeleton-pulse" />
          <div className="video-player-skeleton-text">
            {channel.name} 로딩 중...
          </div>
        </div>
      )}

      {/* Error state - no live stream found */}
      {!isResolving && error && (
        <div className="video-player-error">
          <div className="video-player-error-content">
            <div className="video-player-error-icon">📡</div>
            <h3>
              {error === 'no-live'
                ? '현재 라이브 방송이 없습니다'
                : '연결에 실패했습니다'}
            </h3>
            <p>
              {error === 'no-live'
                ? '이 채널은 현재 라이브 방송을 하고 있지 않거나, YouTube에서 임베드를 제한하고 있습니다.'
                : '네트워크 오류가 발생했습니다. 다시 시도해 주세요.'}
            </p>
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

      {/* YouTube iframe - only render when we have a real video ID */}
      {!isResolving && embedUrl && (
        <iframe
          key={`${videoId}-${retryKey}`}
          src={embedUrl}
          title={`${channel.name} 라이브 스트림`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="video-player-iframe"
          onLoad={handleLoad}
          style={{
            opacity: isLoading ? 0 : 1,
          }}
        />
      )}

      {!isResolving && !isLoading && !error && (
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
