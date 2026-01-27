import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CourseSidebar, CourseSidebarSkeleton } from "@/components/course-sidebar";
import { Navbar } from "@/components/navbar";

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
      <SidebarInset>
        <Navbar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
