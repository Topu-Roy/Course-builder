"use client";

import { useState, useTransition } from "react";
import { api } from "@/trpc/react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { type SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Code, GripVertical, Heading, Image as ImageIcon, Save, Trash, Type, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type BlockType, type ContentBlock } from "@/lib/types";

interface ChapterContentEditorProps {
  chapterId: string;
  initialContent: unknown;
  initialTitle: string;
}

interface BlockRendererProps {
  block: ContentBlock;
  updateBlock?: (id: string, content: string) => void;
  updateMetadata?: (id: string, field: string, value: string | number) => void;
  removeBlock?: (id: string) => void;
  dragHandleProps?: SyntheticListenerMap | undefined;
  isOverlay?: boolean;
}

const BlockRenderer = ({
  block,
  updateBlock,
  updateMetadata,
  removeBlock,
  dragHandleProps,
  isOverlay,
}: BlockRendererProps) => {
  return (
    <div
      className={`group relative mb-4 rounded-lg border bg-white p-4 transition-all dark:bg-slate-950 ${
        isOverlay ? "ring-primary cursor-grabbing shadow-xl ring-2" : "hover:shadow-md"
      }`}
    >
      {/* Toolbar */}
      <div className="bg-background/80 absolute top-2 right-2 z-20 flex items-center gap-1 rounded-md border p-1 shadow-sm backdrop-blur">
        <div
          {...dragHandleProps}
          className="hover:bg-muted cursor-grab rounded p-1 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="text-muted-foreground h-4 w-4" />
        </div>
        {removeBlock && (
          <>
            <div className="bg-border mx-1 h-3 w-px" />
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 h-6 w-6"
              onClick={() => removeBlock(block.id)}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>

      <div className="mr-8">
        {/* Block Type Badge */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-muted-foreground bg-muted rounded px-2 py-0.5 font-mono text-xs uppercase select-none">
            {block.type}
          </span>
        </div>

        {/* Block Content Renderers */}
        {block.type === "heading" && (
          <Input
            value={block.content}
            onChange={(e) => updateBlock?.(block.id, e.target.value)}
            className="text-lg font-bold"
            placeholder="Heading Text"
            readOnly={isOverlay}
          />
        )}

        {block.type === "text" && (
          <Textarea
            value={block.content}
            onChange={(e) => updateBlock?.(block.id, e.target.value)}
            placeholder="Type your text content here..."
            className="min-h-[100px]"
            readOnly={isOverlay}
          />
        )}

        {block.type === "code" && (
          <div className="space-y-2">
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock?.(block.id, e.target.value)}
              placeholder="Paste code here..."
              className="min-h-[150px] bg-slate-950 font-mono text-sm text-slate-50"
              readOnly={isOverlay}
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs">Language:</Label>
              <Input
                value={block.metadata?.language ?? ""}
                onChange={(e) => updateMetadata?.(block.id, "language", e.target.value)}
                placeholder="e.g. typescript"
                className="h-6 w-32 text-xs"
                readOnly={isOverlay}
              />
            </div>
          </div>
        )}

        {block.type === "image" && (
          <div className="space-y-2">
            <Input
              value={block.content}
              onChange={(e) => updateBlock?.(block.id, e.target.value)}
              placeholder="Image URL (https://...)"
              readOnly={isOverlay}
            />
            {block.content && (
              <div className="bg-muted relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.content} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        )}

        {block.type === "video" && (
          <div className="space-y-2">
            <Input
              value={block.content}
              onChange={(e) => updateBlock?.(block.id, e.target.value)}
              placeholder="YouTube Video URL (https://...)"
              readOnly={isOverlay}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface SortableBlockItemProps extends BlockRendererProps {
  id: string;
}

const SortableBlockItem = ({ id, ...props }: SortableBlockItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.3 : 1, // Dim original item while dragging
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockRenderer {...props} dragHandleProps={listeners} />
    </div>
  );
};

export const ChapterContentEditor = ({ chapterId, initialContent, initialTitle }: ChapterContentEditorProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    Array.isArray(initialContent) ? (initialContent as ContentBlock[]) : []
  );
  const [initialBlocks, setInitialBlocks] = useState<ContentBlock[]>(
    Array.isArray(initialContent) ? (initialContent as ContentBlock[]) : []
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  // const [activeId, setActiveId] = useState<string | null>(null);

  // derived isPending will be defined after mutation hook

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
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
    setActiveId(null);
  };

  const { mutate: updateChapter, isPending: isUpdatePending } = api.chapter.update.useMutation({
    onSuccess: () => {
      toast.success("Chapter updated successfully");
      setInitialBlocks(blocks);
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to update chapter");
    },
  });

  const isPending = isUpdatePending;

  const onSave = () => {
    updateChapter({
      chapterId: chapterId,
      title: title,
      content: blocks.map((b) => ({
        id: b.id,
        type: b.type,
        content: b.content,
        metadata: b.metadata,
      })),
    });
  };

  const isDirty = JSON.stringify(blocks) !== JSON.stringify(initialBlocks) || title !== initialTitle;

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;

  return (
    <div className="space-y-8">
      <div className="bg-background/95 sticky top-4 z-10 flex items-center justify-between border-b py-4 backdrop-blur">
        <h1 className="text-2xl font-bold">Edit Chapter Content</h1>
        <div className="flex gap-2">
          <Button disabled={isPending || !isDirty} onClick={onSave} variant={isDirty ? "default" : "secondary"}>
            {isPending ? "Saving..." : isDirty ? "Save Changes" : "Saved"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card grid gap-4 rounded-lg border p-4 shadow-sm">
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

      {isDirty && (
        <div className="sticky top-[80px] z-10 mb-4 flex items-center justify-between rounded border border-yellow-200 bg-yellow-100 p-2 text-sm text-yellow-800">
          <span>You have unsaved changes.</span>
          <Button size="sm" onClick={onSave} disabled={isPending}>
            Save
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                id={block.id}
                block={block}
                updateBlock={updateBlock}
                updateMetadata={updateMetadata}
                removeBlock={removeBlock}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>{activeBlock ? <BlockRenderer block={activeBlock} isOverlay /> : null}</DragOverlay>
      </DndContext>

      {/* Add Block Controls */}
      <div className="bg-background/95 sticky bottom-4 z-10 grid grid-cols-2 gap-2 rounded-lg border p-2 shadow-lg backdrop-blur md:grid-cols-5">
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
