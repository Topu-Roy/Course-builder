"use client";

import { type User } from "better-auth";
import { Home, LogIn, Menu, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth-buttons";
import { UserAvatar } from "@/components/user-avatar";

type MobileNavProps = {
  user?: User;
};

export function MobileNav({ user }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 pl-2 text-left">
            <span className="font-bold">Course Builder</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-6">
          {/* User Profile Section if Logged In */}
          {user && (
            <div className="flex items-center gap-4 px-2">
              <UserAvatar user={user} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">{user.email}</span>
              </div>
            </div>
          )}

          {user && <Separator />}

          <nav className="flex flex-col gap-3">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-base">
                <Home className="mr-3 h-5 w-5" />
                Home
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="ghost" className="w-full justify-start text-base">
                <PlusCircle className="mr-3 h-5 w-5" />
                Create Course
              </Button>
            </Link>
          </nav>

          <Separator />

          {/* Auth Actions */}
          <div className="mt-auto">
            {user ? (
              <div className="px-2">
                <SignOutButton as="button" />
              </div>
            ) : (
              <Link href="/auth/sign-in">
                <Button className="w-full justify-start" variant="default">
                  <LogIn className="mr-3 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
