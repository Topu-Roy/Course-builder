/* eslint-disable */

import { tryCatch } from "./try-catch";

export async function searchYouTubeVideo(query: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_DATA_V3_API_KEY;

  if (!apiKey) {
    console.warn("YouTube API key not found. Skipping video search.");
    return null;
  }

  const { data, error } = await tryCatch(async () => {
    const searchQuery = encodeURIComponent(`${query} tutorial educational`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoEmbeddable=true&maxResults=1&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.json();
      console.error(`YouTube API error: ${response.status}`, JSON.stringify(errorBody, null, 2));
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return null;
  });

  if (error) {
    console.error("Error searching YouTube:", error);
    return null;
  }

  return data;
}
