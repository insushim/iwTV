export type ChannelType = 'youtube' | 'hls' | 'external';

export type ChannelCategory =
  | 'news'
  | 'public'
  | 'world';

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
  { id: 'public', name: '공공', icon: '🏛', color: 'cyan' },
  { id: 'world', name: '해외', icon: '🌍', color: 'indigo' },
];
