import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CourseSidebarButton } from "./course-sidebar-button";

type ChapterSidebarProps = {
  courseId: string;
  chapters: { id: string; title: string; order: number }[];
  currentChapterId: string;
};

export function CourseSidebar({ courseId, chapters, currentChapterId }: ChapterSidebarProps) {
  const sortedChapters = chapters.sort((a, b) => a.order - b.order);

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          {sortedChapters.map((chapter) => (
            <SidebarMenuItem key={chapter.id} className="py-2" aria-current={chapter.id === currentChapterId}>
              <CourseSidebarButton chapterId={chapter.id} courseId={courseId} />
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
