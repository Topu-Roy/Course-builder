import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSession } from "@/lib/auth";
import { UserAvatar } from "./user-avatar";

export function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <AsyncNavbar />
    </Suspense>
  );
}

async function AsyncNavbar() {
  const session = await getServerSession();

  return (
    <div className="bg-background flex h-full w-full items-center border-b px-6 py-4 shadow-sm">
      <Link href="/" className="flex items-center gap-x-2 transition-opacity hover:opacity-75">
        <h1 className="text-foreground text-xl font-bold">Course Builder</h1>
      </Link>

      <div className="ml-auto flex items-center gap-x-2">
        <Link href="/create">
          <Button variant="ghost" size="sm">
            Create Course
          </Button>
        </Link>

        {session?.user.id ? (
          <UserAvatar user={session.user} />
        ) : (
          <Link href="/auth/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function NavbarSkeleton() {
  return (
    <div className="bg-background flex h-full w-full items-center border-b px-6 py-4 shadow-sm">
      <Link href="/" className="flex items-center gap-x-2 transition-opacity hover:opacity-75">
        <h1 className="text-foreground text-xl font-bold">Course Builder</h1>
      </Link>

      <div className="ml-auto flex items-center gap-x-2">
        <Link href="/create">
          <Button variant="ghost" size="sm">
            Create Course
          </Button>
        </Link>

        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
