import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/mobile-nav";
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
    <div className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-x-2 transition-opacity hover:opacity-75">
          <h1 className="font-heading text-xl font-bold">Course Builder</h1>
        </Link>

        <div className="ml-auto md:hidden">
          <MobileNav user={session?.user} />
        </div>

        <div className="ml-auto hidden items-center gap-x-3 md:flex">
          <Link href="/explore">
            <Button variant="ghost" size="sm">
              Explore
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" size="sm">
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
    </div>
  );
}

function NavbarSkeleton() {
  return (
    <div className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-x-2 transition-opacity hover:opacity-75">
          <h1 className="text-xl font-bold">Course Builder</h1>
        </Link>

        <div className="ml-auto flex items-center gap-x-3">
          <Link href="/explore">
            <Button variant="ghost" size="sm">
              Explore
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="ghost" size="sm">
              Create Course
            </Button>
          </Link>

          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
