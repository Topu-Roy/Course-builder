"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton } from "./ui/sidebar";

type CourseSidebarButtonProps = {
  chapterId: string;
  courseId: string;
  chapter: { title: string };
  progress: { completed: boolean; progress: number };
};

export function CourseSidebarButton({ chapterId, courseId, chapter, progress }: CourseSidebarButtonProps) {
  const [maxScrollPercentage, setMaxScrollPercentage] = useState(progress.progress);
  const [timeSpent, setTimeSpent] = useState(0);
  const path = usePathname();
  const { mutate: updateProgress } = api.course.updateProgress.useMutation();
  const utils = api.useUtils();
  const isCurrentChapter = path.includes(chapterId);

  // Initialize from server progress
  useEffect(() => {
    if (progress.progress === 100) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMaxScrollPercentage(100);
    }
  }, [progress.progress]);

  // Update server when reaching 100%
  useEffect(() => {
    if (maxScrollPercentage === 100 && progress.progress !== 100) {
      updateProgress(
        { chapterId, progress: 100 },
        {
          onSuccess: () => {
            // Invalidate the new sidebar data query
            void utils.course.getSidebarData.invalidate({ courseId });
            // Optionally invalidate getChapter if needed, but sidebar is main thing
          },
        }
      );
    }
  }, [maxScrollPercentage, progress.progress, chapterId, updateProgress, utils, courseId]);

  // Scroll tracking
  useEffect(() => {
    if (progress.progress === 100) {
      return;
    }

    if (!isCurrentChapter) {
      return;
    }

    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;

      let percentage = Number((currentProgress / scrollHeight).toFixed(2)) * 100;

      // Smart Completion Logic:
      // If scrolled to 100% but time < 3 mins, cap at 99%
      if (percentage >= 100 && timeSpent < 180) {
        percentage = 99;
      }

      setMaxScrollPercentage((prev) => {
        // Don't overwrite if already 100 (manual or previous valid completion)
        if (prev === 100) return prev;

        // Only update if progress has increased
        if (prev >= percentage) return prev;

        const newMaxScroll = Math.max(percentage, prev);
        return newMaxScroll;
      });
    };

    window.addEventListener("scroll", updateScrollCompletion);
    return () => window.removeEventListener("scroll", updateScrollCompletion);
  }, [isCurrentChapter, progress.progress, timeSpent]);

  // Timer for active chapter
  useEffect(() => {
    if (progress.progress === 100) {
      return;
    }

    if (!isCurrentChapter) {
      return;
    }

    const timer = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = prev + 1;
        // Check if we qualify for auto-completion (3 mins = 180s)
        if (newTime >= 180) {
          setMaxScrollPercentage((prev) => {
            // If we have seen all content (99%+) and heavily spent time, mark complete
            if (prev >= 99 && prev < 100) {
              return 100;
            }
            return prev;
          });
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCurrentChapter, progress.progress]);

  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (maxScrollPercentage / 100) * circumference;

  if (isCurrentChapter) {
    return (
      <SidebarMenuButton isActive={true}>
        {maxScrollPercentage === 100 ? (
          <CheckCircle className="size-4" />
        ) : (
          <div className="relative flex size-4 items-center justify-center font-mono text-[10px]">
            <svg className="size-full -rotate-90 transform" viewBox="0 0 24 24">
              <circle
                className="text-muted-foreground/20"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="12"
                cy="12"
              />
              <circle
                className="text-primary"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="12"
                cy="12"
              />
            </svg>
          </div>
        )}
        <span className="truncate">{chapter.title}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton>
      <Link href={`/course/${courseId}/chapter/${chapterId}`} className="flex w-full items-center gap-2">
        {progress.progress === 100 ? (
          <CheckCircle className="size-4" />
        ) : (
          <div className="relative flex size-4 items-center justify-center font-mono text-[10px]">
            {/* Small ring for non-active chapters too, or just empty? 
                 Let's keep it consistent but maybe cleaner if it's 0. 
                 If 0, maybe just empty circle or nothing? 
                 Design choice: Show progress if > 0 */}
            {progress.progress > 0 && progress.progress < 100 ? (
              <svg className="size-full -rotate-90 transform" viewBox="0 0 24 24">
                <circle
                  className="text-muted-foreground/20"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="12"
                  cy="12"
                />
                <circle
                  className="text-primary"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress.progress / 100) * circumference}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="12"
                  cy="12"
                />
              </svg>
            ) : (
              <div className="border-muted-foreground/20 size-4 rounded-full border-2" />
            )}
          </div>
        )}
        <span className="truncate">{chapter.title}</span>
      </Link>
    </SidebarMenuButton>
  );
}
