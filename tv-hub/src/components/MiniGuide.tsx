'use client';

import { useStore } from '@/store/useStore';
import { channels } from '@/data/channels';
import ChannelLogo from './ChannelLogo';

export default function MiniGuide() {
  const { currentChannel, setCurrentChannel } = useStore();

  if (!currentChannel) return null;

  // Get channels in the same category
  const relatedChannels = channels.filter(
    (ch) =>
      ch.category === currentChannel.category && ch.id !== currentChannel.id
  );

  if (relatedChannels.length === 0) return null;

  return (
    <div className="mini-guide">
      <div className="mini-guide-header">
        <span className="mini-guide-title">같은 카테고리 채널</span>
      </div>
      <div className="mini-guide-list">
        {relatedChannels.map((channel) => (
          <button
            key={channel.id}
            className="mini-guide-item"
            onClick={() => setCurrentChannel(channel)}
            title={channel.name}
          >
            <div className="mini-guide-item-logo">
              <ChannelLogo
                channelId={channel.id}
                name={channel.name}
                officialUrl={channel.officialUrl}
                size="sm"
              />
            </div>
            <span className="mini-guide-item-name">{channel.name}</span>
            {channel.type === 'youtube' && (
              <span className="live-badge live-badge-xs">LIVE</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
