import { SidebarProvider } from "@/components/ui/sidebar";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
