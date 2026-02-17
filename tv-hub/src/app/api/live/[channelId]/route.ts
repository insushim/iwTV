import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const preferredRegion = 'icn1';

const cache = new Map<string, { videoId: string; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000;

const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

async function fetchLiveVideoId(channelId: string): Promise<string | null> {
  const cached = cache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.videoId;
  }

  try {
    // Use YouTube InnerTube API to resolve the /live URL
    // This bypasses consent pages and is the same API YouTube's frontend uses
    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/navigation/resolve_url?key=${INNERTUBE_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240101.00.00',
              hl: 'ko',
              gl: 'KR',
            },
          },
          url: `https://www.youtube.com/channel/${channelId}/live`,
        }),
        cache: 'no-store',
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // The response contains endpoint data - look for videoId in watchEndpoint
    const json = JSON.stringify(data);
    const videoIdMatch = json.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);

    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      cache.set(channelId, { videoId, timestamp: Date.now() });
      return videoId;
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
    return NextResponse.json({ error: 'Invalid channel ID' }, { status: 400 });
  }

  const videoId = await fetchLiveVideoId(channelId);

  const headers = { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' };

  if (videoId) {
    return NextResponse.json({ videoId, channelId }, { headers });
  }

  return NextResponse.json(
    { error: 'No live stream found', channelId },
    { status: 404, headers }
  );
}
