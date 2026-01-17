"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuSkeleton } from "./ui/sidebar";

export function CourseSidebarButton({ chapterId, courseId }: { chapterId: string; courseId: string }) {
  const [maxScrollPercentage, setMaxScrollPercentage] = useState(0); // 100% if completed
  const [timeSpent, setTimeSpent] = useState(0);
  const path = usePathname();
  const { mutate: updateProgress } = api.course.updateProgress.useMutation();
  const { data: progress } = api.course.getProgress.useQuery({ chapterId });
  const { data: chapter, isLoading } = api.course.getChapter.useQuery({ chapterId });
  const utils = api.useUtils();
  const isCurrentChapter = path.includes(chapterId);

  // Initialize from server progress
  useEffect(() => {
    if (progress?.progress === 100) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMaxScrollPercentage(100);
    }
  }, [progress?.progress]);

  // Update server when reaching 100%
  useEffect(() => {
    if (maxScrollPercentage === 100 && progress?.progress !== 100) {
      updateProgress(
        { chapterId, progress: 100 },
        {
          onSuccess: () => {
            void utils.course.getProgress.invalidate();
          },
        }
      );
    }
  }, [maxScrollPercentage, progress?.progress, chapterId, updateProgress, utils]);

  // Scroll tracking
  useEffect(() => {
    if (progress?.progress === 100) {
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
  }, [isCurrentChapter, progress?.progress, timeSpent]);

  // Timer for active chapter
  useEffect(() => {
    if (progress?.progress === 100) {
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
  }, [isCurrentChapter, progress?.progress]);

  if (isLoading) {
    return <SidebarMenuSkeleton />;
  }

  if (isCurrentChapter) {
    return (
      <SidebarMenuButton>
        {maxScrollPercentage === 100 ? (
          <>
            <CheckCircle /> {chapter?.title}
          </>
        ) : maxScrollPercentage === 0 ? (
          <>{chapter?.title}</>
        ) : (
          <>
            <span>{maxScrollPercentage}%</span> {chapter?.title}
          </>
        )}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton>
      <Link href={`/course/${courseId}/chapter/${chapterId}`}>
        {progress?.progress === 100 ? (
          <>
            <CheckCircle /> {chapter?.title}
          </>
        ) : (
          <>{chapter?.title}</>
        )}
      </Link>
    </SidebarMenuButton>
  );
}
