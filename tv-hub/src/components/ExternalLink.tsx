'use client';

import { ExternalLink as ExternalLinkIcon, Tv } from 'lucide-react';
import { Channel } from '@/types/channel';
import ChannelLogo from './ChannelLogo';

interface ExternalLinkProps {
  channel: Channel;
}

export default function ExternalLink({ channel }: ExternalLinkProps) {
  return (
    <div className="external-link-card">
      <div className="external-link-content">
        <div className="external-link-logo">
          <ChannelLogo
            channelId={channel.id}
            name={channel.name}
            officialUrl={channel.officialUrl}
            size="lg"
          />
        </div>

        <div className="external-link-info">
          <h2 className="external-link-name">{channel.name}</h2>
          <p className="external-link-desc">{channel.description}</p>
          {channel.channelNumber !== undefined && (
            <div className="external-link-channel-num">
              <Tv size={14} />
              CH {channel.channelNumber}
            </div>
          )}
        </div>

        <div className="external-link-notice">
          <p>
            이 채널은 저작권 보호를 위해 공식 사이트에서만 시청할 수 있습니다.
          </p>
        </div>

        <a
          href={channel.externalUrl || channel.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link-btn"
        >
          <ExternalLinkIcon size={18} />
          공식 사이트에서 시청하기
        </a>

        {channel.officialUrl &&
          channel.officialUrl !== channel.externalUrl && (
            <a
              href={channel.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link-official"
            >
              {channel.officialUrl}
            </a>
          )}
      </div>
    </div>
  );
}
