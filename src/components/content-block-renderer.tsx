import Image from "next/image";
import { CodeBlock } from "@/components/ui/code-block";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { type ContentBlock } from "@/lib/types";

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

/**
 * Renders an array of content blocks for chapter display.
 * Used in the chapter view page to display course content.
 */
export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block) => (
        <div key={block.id} className="mb-6">
          {block.type === "heading" && <h2 className="mt-6 mb-4 text-2xl font-bold">{block.content}</h2>}

          {block.type === "text" && <p className="mb-4 leading-relaxed">{block.content}</p>}

          {block.type === "code" && (
            <div className="mb-4">
              <CodeBlock code={block.content} language={block.metadata?.language ?? "typescript"} />
            </div>
          )}

          {block.type === "image" && (
            <div className="relative my-6 h-96 w-full">
              <Image src={block.content} alt="Content image" fill className="rounded-lg object-cover" />
            </div>
          )}

          {block.type === "video" && <YouTubeEmbed url={block.content} />}
        </div>
      ))}
    </>
  );
}

/**
 * Extracts a preview text from content blocks.
 * Returns the first text content or a default message.
 */
export function getContentPreview(content: unknown, fallback = "Click to view chapter content"): string {
  if (!Array.isArray(content) || content.length === 0) {
    return fallback;
  }

  const blocks = content as ContentBlock[];
  const firstTextBlock = blocks.find((block) => block.type === "text" || block.type === "heading");

  return firstTextBlock?.content ?? fallback;
}
