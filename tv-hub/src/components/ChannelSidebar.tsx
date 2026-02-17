'use client';

import { useStore } from '@/store/useStore';
import { channels } from '@/data/channels';
import { filterChannels } from '@/utils/channelUtils';
import CategoryFilter from './CategoryFilter';
import ChannelCard from './ChannelCard';

export default function ChannelSidebar() {
  const { selectedCategory, favorites, searchQuery, isSidebarOpen } =
    useStore();

  const filteredChannels = filterChannels(
    channels,
    selectedCategory,
    favorites,
    searchQuery
  );

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <CategoryFilter />

      <div className="sidebar-channels">
        <div className="sidebar-channels-header">
          <span className="sidebar-channels-title">채널 목록</span>
          <span className="sidebar-channels-count">
            {filteredChannels.length}개
          </span>
        </div>

        <div className="sidebar-channels-list">
          {filteredChannels.length === 0 ? (
            <div className="sidebar-empty">
              {selectedCategory === 'favorites' ? (
                <p>즐겨찾기한 채널이 없습니다.</p>
              ) : (
                <p>채널을 찾을 수 없습니다.</p>
              )}
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
