'use client';

import { Star } from 'lucide-react';
import { Channel } from '@/types/channel';
import { useStore } from '@/store/useStore';
import ChannelLogo from './ChannelLogo';

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const { currentChannel, setCurrentChannel, favorites, toggleFavorite } =
    useStore();

  const isActive = currentChannel?.id === channel.id;
  const isFav = favorites.includes(channel.id);

  const handleClick = () => {
    setCurrentChannel(channel);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(channel.id);
  };

  return (
    <div
      className={`channel-card ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${channel.name} 채널 선택`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="channel-card-logo">
        <ChannelLogo
          channelId={channel.id}
          name={channel.name}
          officialUrl={channel.officialUrl}
          size="sm"
        />
      </div>

      <div className="channel-card-info">
        <div className="channel-card-name">{channel.name}</div>
        {channel.channelNumber !== undefined && (
          <div className="channel-card-number">CH {channel.channelNumber}</div>
        )}
      </div>

      <div className="channel-card-actions">
        {channel.type === 'youtube' && (
          <span className="live-badge">LIVE</span>
        )}
        <button
          className={`fav-btn ${isFav ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          title={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
