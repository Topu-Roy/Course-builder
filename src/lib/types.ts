export type BlockType = "text" | "image" | "video" | "code" | "heading";

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    caption?: string | null;
    language?: string | null;
    level?: number | null;
    subHeading?: string | null;
  } | null;
}
