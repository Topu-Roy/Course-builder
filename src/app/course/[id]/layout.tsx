import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CourseSidebar, CourseSidebarSkeleton } from "@/components/course-sidebar";

export default function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<CourseSidebarSkeleton />}>
        <CourseSidebar params={params} />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
