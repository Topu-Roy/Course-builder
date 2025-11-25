export async function searchYouTubeVideo(query: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_DATA_V3_API_KEY;

  if (!apiKey) {
    console.warn("YouTube API key not found. Skipping video search.");
    return null;
  }

  try {
    const searchQuery = encodeURIComponent(`${query} tutorial educational`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoEmbeddable=true&maxResults=1&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return null;
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return null;
  }
}

export async function searchMultipleVideos(queries: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  // Rate limiting: process sequentially with delay
  for (const query of queries) {
    results[query] = await searchYouTubeVideo(query);
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
