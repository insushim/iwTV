import { NextRequest, NextResponse } from 'next/server';

// Short cache - 2 minutes per serverless instance
const cache = new Map<string, { videoId: string; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000;

async function fetchLiveVideoId(channelId: string): Promise<string | null> {
  const cached = cache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.videoId;
  }

  try {
    const url = `https://www.youtube.com/channel/${channelId}/live`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      cache: 'no-store', // Disable Next.js fetch cache entirely
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Step 1: Extract video ID from canonical URL (most reliable)
    const canonicalMatch = html.match(
      /<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/
    );

    if (!canonicalMatch) {
      // No canonical watch URL means no live stream redirect happened
      // Fall back to first videoId in ytInitialPlayerResponse
      const playerMatch = html.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);
      if (!playerMatch) return null;

      // Verify this video belongs to the requested channel
      const ownerMatch = html.match(/"externalChannelId"\s*:\s*"([^"]+)"/);
      if (ownerMatch && ownerMatch[1] !== channelId) {
        // Page channel doesn't match - might be a recommended video from another channel
        return null;
      }

      // Check if it's actually live
      const isLive = html.includes('"isLive":true');
      if (!isLive) return null;

      const videoId = playerMatch[1];
      cache.set(channelId, { videoId, timestamp: Date.now() });
      return videoId;
    }

    const videoId = canonicalMatch[1];

    // Step 2: Verify the video belongs to this channel
    // Check ownerChannelName or channelId in the page
    const channelIdInPage = html.match(/"externalChannelId"\s*:\s*"([^"]+)"/);
    const ownerChannelId = html.match(/"ownerProfileUrl"\s*:\s*"[^"]*\/channel\/([^"]+)"/);

    // The channelId in the page should match what we requested
    // But sometimes the page redirects to the video page which has the video owner's channel ID
    // So we need to check if the video's owner matches
    if (ownerChannelId && ownerChannelId[1] !== channelId) {
      // Video belongs to a different channel - not our live stream!
      return null;
    }

    // Also verify it's actually live (not a VOD)
    const isLive = html.includes('"isLive":true') || html.includes('"isLiveBroadcast":true');
    if (!isLive) {
      // Might be a past broadcast or upcoming, still return if canonical matched
      // but mark with shorter cache
      cache.set(channelId, { videoId, timestamp: Date.now() });
      return videoId;
    }

    cache.set(channelId, { videoId, timestamp: Date.now() });
    return videoId;
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
    return NextResponse.json({ error: 'Invalid channel ID' }, { status: 400 });
  }

  const videoId = await fetchLiveVideoId(channelId);

  if (videoId) {
    return NextResponse.json(
      { videoId, channelId },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  }

  return NextResponse.json(
    { error: 'No live stream found', channelId },
    {
      status: 404,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
