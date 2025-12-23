"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Plus, Save } from "lucide-react";
import { updateChapter } from "@/server/actions/chapter";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { ContentSection } from "@/lib/types";

interface ChapterContentEditorProps {
  chapterId: string;
  initialContent: unknown;
  initialTitle: string;
}

export const ChapterContentEditor = ({
  chapterId,
  initialContent,
  initialTitle,
}: ChapterContentEditorProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  // Ensure content is an array
  const [sections, setSections] = useState<ContentSection[]>(
    Array.isArray(initialContent) ? (initialContent as ContentSection[]) : []
  );
  const [isPending, startTransition] = useTransition();

  const handleSectionChange = (index: number, field: keyof ContentSection, value: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { heading: "New Section", text: "" }]);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const onSave = () => {
    startTransition(async () => {
      try {
        await updateChapter(chapterId, {
          title,
          content: sections,
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Chapter Content</h1>
        <div className="flex gap-2">
          <Button disabled={isPending} onClick={onSave}>
            {isPending ? "Saving..." : "Save Changes"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
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

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="border rounded-lg p-6 relative bg-white dark:bg-slate-950">
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => removeSection(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>

            <h3 className="font-semibold mb-4 text-muted-foreground">Section {index + 1}</h3>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input
                    value={section.heading || ""}
                    onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
                    placeholder="Section Heading"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sub-Heading</Label>
                  <Input
                    value={section.subHeading || ""}
                    onChange={(e) => handleSectionChange(index, "subHeading", e.target.value)}
                    placeholder="Optional sub-heading"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Text Content</Label>
                <Textarea
                  value={section.text || ""}
                  onChange={(e) => handleSectionChange(index, "text", e.target.value)}
                  placeholder="Main text content..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label>Video URL (YouTube)</Label>
                  <div className="relative">
                    <Input
                      value={section.videoUrl || ""}
                      onChange={(e) => handleSectionChange(index, "videoUrl", e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="pr-8"
                    />
                    {section.videoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleSectionChange(index, "videoUrl", "")}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={section.imageUrl || ""}
                    onChange={(e) => handleSectionChange(index, "imageUrl", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Code Block</Label>
                  {section.code && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleSectionChange(index, "code", "")}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Clear Code
                    </Button>
                  )}
                </div>
                <Textarea
                  value={section.code || ""}
                  onChange={(e) => handleSectionChange(index, "code", e.target.value)}
                  placeholder="Paste code snippet here..."
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addSection} variant="outline" className="w-full py-8 border-dashed">
          <Plus className="mr-2 h-4 w-4" />
          Add Content Section
        </Button>
      </div>
    </div>
  );
};
