"use client";

import { Chapter } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ChapterSidebarProps {
  courseId: string;
  chapters: Chapter[];
  currentChapterId: string;
}

export const ChapterSidebar = ({ courseId, chapters, currentChapterId }: ChapterSidebarProps) => {
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  useEffect(() => {
    const storedProgress = localStorage.getItem(`course-progress-${courseId}`);
    if (storedProgress) {
      requestAnimationFrame(() => setProgressMap(JSON.parse(storedProgress)));
    }
  }, [courseId]);

  // Timer for active chapter
  useEffect(() => {
    requestAnimationFrame(() => setTimeSpent(0));
    const timer = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = prev + 1;
        // Check if we qualify for auto-completion (3 mins = 180s)
        if (newTime >= 180) {
          setProgressMap((currentMap) => {
            const currentProgress = currentMap[currentChapterId] || 0;
            // If we have seen all content (99%+) and heavily spent time, mark complete
            if (currentProgress >= 99 && currentProgress < 100) {
              const newMap = { ...currentMap, [currentChapterId]: 100 };
              localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(newMap));
              return newMap;
            }
            return currentMap;
          });
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentChapterId, courseId]);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;

      if (scrollHeight) {
        let percentage = Number((currentProgress / scrollHeight).toFixed(2)) * 100;

        // Smart Completion Logic:
        // If scrolled to 100% but time < 3 mins, cap at 99%
        if (percentage >= 100 && timeSpent < 180) {
          percentage = 99;
        }

        setProgressMap((prev) => {
          const currentVal = prev[currentChapterId] || 0;
          // Don't overwrite if already 100 (manual or previous valid completion)
          if (currentVal === 100) return prev;

          // Only update if progress has increased
          if (currentVal >= percentage) return prev;

          const newMap = {
            ...prev,
            [currentChapterId]: Math.max(percentage, currentVal),
          };
          localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(newMap));
          return newMap;
        });
      }
    };

    window.addEventListener("scroll", updateScrollCompletion);

    return () => {
      window.removeEventListener("scroll", updateScrollCompletion);
    };
  }, [courseId, currentChapterId, timeSpent]);

  const toggleManualComplete = (chapterId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setProgressMap((prev) => {
      const isComplete = prev[chapterId] === 100;
      const newMap = {
        ...prev,
        [chapterId]: isComplete ? 0 : 100,
      };
      localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(newMap));
      return newMap;
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="hidden lg:flex h-full w-80 flex-col fixed inset-y-0 z-50">
      <div className="h-full border-r flex flex-col overflow-y-auto bg-background shadow-sm">
        <div className="p-8 pb-4 border-b">
          <h2 className="font-semibold text-lg">Course Content</h2>
        </div>

        <div className="flex flex-col w-full">
          {chapters.map((chapter) => {
            const isActive = chapter.id === currentChapterId;
            const progress = progressMap[chapter.id] || 0;
            const isCompleted = progress === 100;

            return (
              <Link
                key={chapter.id}
                href={`/course/${courseId}/chapter/${chapter.id}`}
                className={cn(
                  "relative flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
                  isActive && "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 hover:text-slate-700",
                  isCompleted && "text-emerald-700 hover:text-emerald-700",
                  isCompleted && isActive && "bg-emerald-200/20"
                )}
              >
                <div className="flex items-center gap-x-2 py-4 z-10 w-full pr-4">
                  <button
                    onClick={(e) => toggleManualComplete(chapter.id, e)}
                    className="hover:scale-110 transition-transform focus:outline-none"
                  >
                    {isCompleted ? (
                      <CheckCircle
                        size={22}
                        className={cn("text-emerald-500", isActive && "text-emerald-700")}
                      />
                    ) : isActive ? (
                      <PlayCircle size={22} className={cn("text-slate-500", isActive && "text-slate-700")} />
                    ) : (
                      <Lock size={22} className="text-slate-400" />
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className={cn("line-clamp-1", isActive && "font-semibold")}>{chapter.title}</span>
                    {isActive && progress < 100 && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(100 - progress)}% left
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Track */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-100" />

                {/* Progress Indicator */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 h-[2px] bg-emerald-500 transition-all duration-300",
                    isCompleted ? "w-full" : "rounded-r-full"
                  )}
                  style={{ width: isCompleted ? "100%" : `${progress}%` }}
                />

                <div
                  className={cn(
                    "absolute right-0 top-0 bottom-0 w-1 bg-transparent transition-all",
                    isActive && "bg-slate-700",
                    isCompleted && "bg-emerald-700"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
