"use client";

import { api } from "@/trpc/react";
import { ImageIcon, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Spinner } from "./ui/spinner";

type CourseBannerProps = {
  courseId: string;
  bannerUrl?: string | null;
  isCreator: boolean;
};

export const CourseBanner = ({ courseId, bannerUrl, isCreator }: CourseBannerProps) => {
  const router = useRouter();
  const utils = api.useUtils();

  const { mutate: updateCourse, isPending } = api.course.update.useMutation({
    onSuccess: () => {
      toast.success("Banner updated");
      router.refresh();
      void utils.course.getCourseChapters.invalidate({ courseId });
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update banner");
    },
  });

  if (!bannerUrl && !isCreator) {
    return null;
  }

  return (
    <div className="group relative mb-8 aspect-4/1 w-full overflow-hidden rounded-xl bg-slate-100">
      {bannerUrl ? (
        <>
          <Image src={bannerUrl} alt="Course Banner" fill className="object-cover" />
          {isCreator && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  const url = res?.[0]?.ufsUrl;
                  if (url) {
                    updateCourse({ courseId, bannerUrl: url });
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`ERROR! ${error.message}`);
                }}
                content={{
                  button: ({ isUploading }) => (
                    <div className="flex items-center gap-2 font-medium text-white">
                      <Plus className="h-4 w-4" />
                      {isPending || isUploading ? <Spinner /> : "Change Banner"}
                    </div>
                  ),
                }}
                appearance={{
                  button:
                    "bg-transparent hover:bg-white/10 border-2 border-white text-white px-4 py-2 rounded-md h-auto transition-all",
                  allowedContent: "hidden",
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
          <ImageIcon className="h-10 w-10" />
          <p className="text-sm font-medium">No banner image</p>
          {isCreator && (
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.ufsUrl;
                if (url) {
                  updateCourse({ courseId, bannerUrl: url });
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`ERROR! ${error.message}`);
              }}
              content={{
                button: ({ isUploading }) => (isPending || isUploading ? <Spinner /> : "Upload Banner"),
              }}
              appearance={{
                button: "bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md h-auto transition-all",
                allowedContent: "text-slate-400 text-xs mt-2",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
