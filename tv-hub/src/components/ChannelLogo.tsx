/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { getChannelColor, getLogoFallbackUrl, getChannelInitials } from '@/utils/channelUtils';

interface ChannelLogoProps {
  channelId: string;
  name: string;
  officialUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ChannelLogo({
  channelId,
  name,
  officialUrl,
  size = 'md',
  className = '',
}: ChannelLogoProps) {
  const [imgError, setImgError] = useState(false);
  const [clearbitError, setClearbitError] = useState(false);

  const color = getChannelColor(channelId);
  const clearbitUrl = getLogoFallbackUrl(officialUrl);
  const initials = getChannelInitials(name);

  const sizeClasses: Record<string, string> = {
    sm: 'channel-logo-sm',
    md: 'channel-logo-md',
    lg: 'channel-logo-lg',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Show initials fallback
  if (imgError && (clearbitError || !clearbitUrl)) {
    return (
      <div
        className={`channel-logo channel-logo-fallback ${sizeClass} ${className}`}
        style={{ backgroundColor: color }}
        title={name}
      >
        <span className="channel-logo-initials">{initials}</span>
      </div>
    );
  }

  // Try clearbit if primary image failed
  if (imgError && clearbitUrl && !clearbitError) {
    return (
      <div className={`channel-logo ${sizeClass} ${className}`} title={name}>
        <img
          src={clearbitUrl}
          alt={name}
          className="channel-logo-img"
          onError={() => setClearbitError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Primary image (logo path from data)
  return (
    <div className={`channel-logo ${sizeClass} ${className}`} title={name}>
      {clearbitUrl ? (
        <img
          src={clearbitUrl}
          alt={name}
          className="channel-logo-img"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className="channel-logo channel-logo-fallback"
          style={{ backgroundColor: color, width: '100%', height: '100%' }}
        >
          <span className="channel-logo-initials">{initials}</span>
        </div>
      )}
    </div>
  );
}
