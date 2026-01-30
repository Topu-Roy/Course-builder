"use client";

import { api } from "@/trpc/react";
import { ImageIcon, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Spinner } from "./ui/spinner";

type CourseThumbnailProps = {
  courseId: string;
  imageUrl?: string | null;
  isCreator: boolean;
};

export const CourseThumbnail = ({ courseId, imageUrl, isCreator }: CourseThumbnailProps) => {
  const router = useRouter();
  const utils = api.useUtils();

  const { mutate: updateCourse, isPending } = api.course.update.useMutation({
    onSuccess: () => {
      toast.success("Thumbnail updated");
      router.refresh();
      void utils.course.getCourseChapters.invalidate({ courseId });
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update thumbnail");
    },
  });

  return (
    <div className="group border-primary bg-foreground/90 relative aspect-square w-28 overflow-hidden rounded-xl border md:w-40">
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt="Course Thumbnail" fill className="object-cover" />
          {isCreator && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  const url = res?.[0]?.ufsUrl;
                  if (url) {
                    updateCourse({ courseId, imageUrl: url });
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`ERROR! ${error.message}`);
                }}
                content={{
                  button: ({ isUploading }) => (
                    <div className="flex items-center justify-center text-white">
                      {isPending || isUploading ? <Spinner /> : <Plus className="h-6 w-6" />}
                    </div>
                  ),
                }}
                appearance={{
                  button: "bg-transparent h-full w-full",
                  allowedContent: "hidden",
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
          <ImageIcon className="h-8 w-8" />
          {isCreator && (
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.ufsUrl;
                if (url) {
                  updateCourse({ courseId, imageUrl: url });
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`ERROR! ${error.message}`);
              }}
              content={{
                button: ({ isUploading }) =>
                  isPending || isUploading ? <Spinner /> : <span className="text-xs font-medium">Upload</span>,
              }}
              appearance={{
                button: "bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md h-auto transition-all",
                allowedContent: "hidden",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
