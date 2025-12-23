import Link from "next/link";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <div className="flex h-full w-full items-center border-b px-6 py-4 shadow-sm bg-background">
      <Link href="/create" className="flex items-center gap-x-2 transition-opacity hover:opacity-75">
        <h1 className="text-xl font-bold text-foreground">Course Builder</h1>
      </Link>

      <div className="ml-auto flex items-center gap-x-2">
        <Link href="/create">
          <Button variant="ghost" size="sm">
            Create Course
          </Button>
        </Link>
      </div>
    </div>
  );
};
