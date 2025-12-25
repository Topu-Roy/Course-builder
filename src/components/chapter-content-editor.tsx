"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash,
  Save,
  ArrowUp,
  ArrowDown,
  Type,
  Image as ImageIcon,
  Video,
  Code,
  Heading,
  GripVertical,
} from "lucide-react";
import { updateChapter } from "@/server/actions/chapter";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ContentBlock, BlockType } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ChapterContentEditorProps {
  chapterId: string;
  initialContent: unknown;
  initialTitle: string;
}

interface BlockItemProps {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  updateBlock: (id: string, content: string) => void;
  updateMetadata: (id: string, field: string, value: string | number) => void;
  removeBlock: (id: string) => void;
  moveBlock: (index: number, direction: "up" | "down") => void;
}

const BlockItem = ({
  block,
  index,
  totalBlocks,
  updateBlock,
  updateMetadata,
  removeBlock,
  moveBlock,
}: BlockItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 relative bg-white dark:bg-slate-950 group transition-all hover:shadow-md mb-4"
    >
      {/* Toolbar */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur rounded-md p-1 border z-20 shadow-sm">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="w-px h-3 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={index === 0}
          onClick={() => moveBlock(index, "up")}
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={index === totalBlocks - 1}
          onClick={() => moveBlock(index, "down")}
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
        <div className="w-px h-3 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:bg-destructive/10"
          onClick={() => removeBlock(block.id)}
        >
          <Trash className="h-3 w-3" />
        </Button>
      </div>

      <div className="mr-8">
        {/* Block Type Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded select-none">
            {block.type}
          </span>
        </div>

        {/* Block Content Renderers */}
        {block.type === "heading" && (
          <Input
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            className="font-bold text-lg"
            placeholder="Heading Text"
          />
        )}

        {block.type === "text" && (
          <Textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            placeholder="Type your text content here..."
            className="min-h-[100px]"
          />
        )}

        {block.type === "code" && (
          <div className="space-y-2">
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder="Paste code here..."
              className="font-mono text-sm bg-slate-950 text-slate-50 min-h-[150px]"
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs">Language:</Label>
              <Input
                value={block.metadata?.language || ""}
                onChange={(e) => updateMetadata(block.id, "language", e.target.value)}
                placeholder="e.g. typescript"
                className="h-6 w-32 text-xs"
              />
            </div>
          </div>
        )}

        {block.type === "image" && (
          <div className="space-y-2">
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder="Image URL (https://...)"
            />
            {block.content && (
              <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.content} alt="Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        )}

        {block.type === "video" && (
          <div className="space-y-2">
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder="YouTube Video URL (https://...)"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const ChapterContentEditor = ({
  chapterId,
  initialContent,
  initialTitle,
}: ChapterContentEditorProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    Array.isArray(initialContent) ? (initialContent as ContentBlock[]) : []
  );
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateBlock = (id: string, content: string) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, content } : block)));
  };

  const updateMetadata = (id: string, field: string, value: string | number) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              metadata: { ...block.metadata, [field]: value },
            }
          : block
      )
    );
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: "",
      metadata: type === "heading" ? { level: 2 } : {},
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const onSave = () => {
    startTransition(async () => {
      try {
        await updateChapter(chapterId, {
          title,
          content: blocks,
        });
        toast.success("Chapter updated successfully");
        router.refresh();
      } catch {
        toast.error("Failed to update chapter");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between sticky top-4 bg-background/95 backdrop-blur z-10 py-4 border-b">
        <h1 className="text-2xl font-bold">Edit Chapter Content</h1>
        <div className="flex gap-2">
          <Button disabled={isPending} onClick={onSave}>
            {isPending ? "Saving..." : "Save Changes"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-4 border rounded-lg bg-card shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="chapter-title">Chapter Title</Label>
          <Input
            id="chapter-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter Title"
          />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <BlockItem
                key={block.id}
                block={block}
                index={index}
                totalBlocks={blocks.length}
                updateBlock={updateBlock}
                updateMetadata={updateMetadata}
                removeBlock={removeBlock}
                moveBlock={moveBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Block Controls */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sticky bottom-4 p-2 bg-background/95 backdrop-blur border rounded-lg shadow-lg z-10">
        <Button variant="outline" onClick={() => addBlock("heading")} className="gap-2">
          <Heading className="h-4 w-4" />
          Heading
        </Button>
        <Button variant="outline" onClick={() => addBlock("text")} className="gap-2">
          <Type className="h-4 w-4" />
          Text
        </Button>
        <Button variant="outline" onClick={() => addBlock("code")} className="gap-2">
          <Code className="h-4 w-4" />
          Code
        </Button>
        <Button variant="outline" onClick={() => addBlock("image")} className="gap-2">
          <ImageIcon className="h-4 w-4" />
          Image
        </Button>
        <Button variant="outline" onClick={() => addBlock("video")} className="gap-2">
          <Video className="h-4 w-4" />
          Video
        </Button>
      </div>
    </div>
  );
};
