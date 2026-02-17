export type ChannelType = 'youtube' | 'hls' | 'external';

export type ChannelCategory =
  | 'news'
  | 'broadcast'
  | 'general'
  | 'economy'
  | 'public'
  | 'religion'
  | 'world'
  | 'sports';

export interface Channel {
  id: string;
  name: string;
  category: ChannelCategory;
  logo: string;
  type: ChannelType;
  youtubeChannelId?: string;
  hlsUrl?: string;
  externalUrl?: string;
  description: string;
  officialUrl?: string;
  channelNumber?: number;
}

export interface CategoryInfo {
  id: ChannelCategory | 'favorites' | 'all';
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', name: '전체', icon: '📡', color: 'indigo' },
  { id: 'favorites', name: '즐겨찾기', icon: '⭐', color: 'yellow' },
  { id: 'news', name: '뉴스', icon: '📰', color: 'red' },
  { id: 'broadcast', name: '지상파', icon: '📺', color: 'blue' },
  { id: 'general', name: '종편', icon: '📋', color: 'purple' },
  { id: 'economy', name: '경제', icon: '💰', color: 'green' },
  { id: 'public', name: '공공', icon: '🏛', color: 'cyan' },
  { id: 'religion', name: '종교', icon: '✝', color: 'amber' },
  { id: 'world', name: '해외', icon: '🌍', color: 'indigo' },
  { id: 'sports', name: '스포츠', icon: '⚽', color: 'orange' },
];
