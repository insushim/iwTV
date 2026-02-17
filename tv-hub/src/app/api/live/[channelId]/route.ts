import { NextRequest, NextResponse } from 'next/server';

// Cache video IDs for 5 minutes to avoid hammering YouTube
const cache = new Map<string, { videoId: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchLiveVideoId(channelId: string): Promise<string | null> {
  // Check cache first
  const cached = cache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.videoId;
  }

  try {
    // Fetch the channel's live page
    const url = `https://www.youtube.com/channel/${channelId}/live`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 300 }, // Next.js cache for 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Try multiple patterns to extract the live video ID
    let videoId: string | null = null;

    // Pattern 1: canonical URL with /watch?v=
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
    if (canonicalMatch) {
      videoId = canonicalMatch[1];
    }

    // Pattern 2: og:url meta tag
    if (!videoId) {
      const ogMatch = html.match(/<meta\s+property="og:url"\s+content="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
      if (ogMatch) {
        videoId = ogMatch[1];
      }
    }

    // Pattern 3: videoId in ytInitialPlayerResponse
    if (!videoId) {
      const playerMatch = html.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);
      if (playerMatch) {
        videoId = playerMatch[1];
      }
    }

    // Pattern 4: embedded player vars
    if (!videoId) {
      const embedMatch = html.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
    }

    // Pattern 5: watch URL in the page
    if (!videoId) {
      const watchMatch = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (watchMatch) {
        videoId = watchMatch[1];
      }
    }

    if (videoId) {
      // Verify it looks like a valid YouTube video ID (11 chars)
      if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        cache.set(channelId, { videoId, timestamp: Date.now() });
        return videoId;
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch live video ID for ${channelId}:`, error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;

  if (!channelId || !/^UC[a-zA-Z0-9_-]+$/.test(channelId)) {
    return NextResponse.json(
      { error: 'Invalid channel ID' },
      { status: 400 }
    );
  }

  const videoId = await fetchLiveVideoId(channelId);

  if (videoId) {
    return NextResponse.json(
      { videoId, channelId },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  }

  return NextResponse.json(
    { error: 'No live stream found', channelId },
    { status: 404 }
  );
}
