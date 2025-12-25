export type BlockType = "text" | "image" | "video" | "code" | "heading";

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    caption?: string; // For images/videos
    language?: string; // For code
    level?: number; // For headings
    subHeading?: string; // Keeping for backward/forward compat if needed, or just use separate blocks
  };
}
