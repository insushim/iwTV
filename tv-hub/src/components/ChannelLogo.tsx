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

  const color = getChannelColor(channelId);
  const faviconUrl = getLogoFallbackUrl(officialUrl);
  const initials = getChannelInitials(name);

  const sizeClasses: Record<string, string> = {
    sm: 'channel-logo-sm',
    md: 'channel-logo-md',
    lg: 'channel-logo-lg',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (imgError || !faviconUrl) {
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

  return (
    <div className={`channel-logo ${sizeClass} ${className}`} title={name}>
      <img
        src={faviconUrl}
        alt={name}
        className="channel-logo-img"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
}
