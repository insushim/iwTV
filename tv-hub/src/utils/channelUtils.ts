import { Channel, ChannelCategory } from '@/types/channel';
import { CHANNEL_COLORS } from '@/data/channels';

type FilterCategory = ChannelCategory | 'favorites' | 'all';

export function filterChannels(
  channels: Channel[],
  category: FilterCategory,
  favorites: string[],
  searchQuery: string
): Channel[] {
  let filtered = [...channels];

  // Filter by category
  if (category === 'favorites') {
    filtered = filtered.filter((ch) => favorites.includes(ch.id));
  } else if (category !== 'all') {
    filtered = filtered.filter((ch) => ch.category === category);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (ch) =>
        ch.name.toLowerCase().includes(query) ||
        ch.description.toLowerCase().includes(query) ||
        ch.id.toLowerCase().includes(query) ||
        (ch.channelNumber !== undefined &&
          ch.channelNumber.toString().includes(query))
    );
  }

  return filtered;
}

export function getChannelColor(channelId: string): string {
  return CHANNEL_COLORS[channelId] || '#6366f1';
}

export function getLogoFallbackUrl(officialUrl?: string): string | null {
  if (!officialUrl) return null;
  try {
    const url = new URL(officialUrl);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
  } catch {
    return null;
  }
}

export function getChannelInitials(name: string): string {
  const cleaned = name
    .replace(/TV|뉴스|방송/gi, '')
    .trim();
  const source = cleaned.length > 0 ? cleaned : name;
  return source.slice(0, 3).toUpperCase();
}
