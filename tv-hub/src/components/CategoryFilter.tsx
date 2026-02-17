'use client';

import { CATEGORIES, ChannelCategory } from '@/types/channel';
import { channels } from '@/data/channels';
import { useStore } from '@/store/useStore';

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory, favorites } = useStore();

  const getCategoryCount = (
    categoryId: ChannelCategory | 'favorites' | 'all'
  ): number => {
    if (categoryId === 'all') return channels.length;
    if (categoryId === 'favorites') return favorites.length;
    return channels.filter((ch) => ch.category === categoryId).length;
  };

  return (
    <div className="category-filter">
      <div className="category-filter-label">카테고리</div>
      <div className="category-filter-list">
        {CATEGORIES.map((cat) => {
          const count = getCategoryCount(cat.id);
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              className={`category-filter-btn ${isActive ? 'active' : ''} category-color-${cat.color}`}
              onClick={() => setSelectedCategory(cat.id)}
              aria-label={`${cat.name} (${count})`}
              aria-pressed={isActive}
            >
              <span className="category-filter-icon">{cat.icon}</span>
              <span className="category-filter-name">{cat.name}</span>
              <span className="category-filter-count">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
