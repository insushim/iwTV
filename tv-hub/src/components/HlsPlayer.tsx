'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { Channel } from '@/types/channel';

interface HlsPlayerProps {
  channel: Channel;
}

export default function HlsPlayer({ channel }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.hlsUrl) return;

    let cancelled = false;

    const initHls = async () => {
      try {
        const HlsModule = await import('hls.js');
        const Hls = HlsModule.default;

        if (cancelled) return;

        if (Hls.isSupported()) {
          destroyHls();

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });

          hlsRef.current = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!cancelled) {
              setIsLoading(false);
              video.play().catch(() => {});
            }
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (cancelled) return;
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (retryCount < maxRetries) {
                    hls.startLoad();
                    setRetryCount((prev) => prev + 1);
                  } else {
                    setHasError(true);
                    setIsLoading(false);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setHasError(true);
                  setIsLoading(false);
                  destroyHls();
                  break;
              }
            }
          });

          hls.loadSource(channel.hlsUrl!);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = channel.hlsUrl!;
          video.addEventListener('loadedmetadata', () => {
            if (!cancelled) {
              setIsLoading(false);
              video.play().catch(() => {});
            }
          });
          video.addEventListener('error', () => {
            if (!cancelled) {
              setHasError(true);
              setIsLoading(false);
            }
          });
        } else {
          setHasError(true);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    initHls();

    return () => {
      cancelled = true;
      destroyHls();
    };
  }, [channel.hlsUrl, retryCount, destroyHls]);

  if (hasError) {
    return (
      <div className="video-player-error">
        <div className="video-player-error-content">
          <div className="video-player-error-icon">📡</div>
          <h3>스트림을 불러올 수 없습니다</h3>
          <p>{channel.name}의 실시간 방송에 접근할 수 없습니다.</p>
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
    <div className="video-player-hls">
      {isLoading && (
        <div className="video-player-skeleton">
          <div className="video-player-skeleton-pulse" />
          <div className="video-player-skeleton-text">
            {channel.name} 로딩 중...
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="video-player-video"
        controls
        playsInline
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
}
