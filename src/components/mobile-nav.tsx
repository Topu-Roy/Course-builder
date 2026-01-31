"use client";

import { type User } from "better-auth";
import {
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  LogIn,
  Menu,
  PlusCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth-buttons";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  user?: User;
};

type Route = {
  label: string;
  icon: LucideIcon;
  href: Parameters<typeof Link>[0]["href"];
  protected?: boolean;
  premium?: boolean;
};

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();

  const routes: Route[] = [
    {
      label: "Home",
      icon: Home,
      href: "/" satisfies Parameters<typeof Link>[0]["href"],
    },
    {
      label: "Explore",
      icon: Compass,
      href: "/explore" satisfies Parameters<typeof Link>[0]["href"],
    },
    {
      label: "My Created",
      icon: BookOpen,
      href: "/created",
      protected: true,
    },
    {
      label: "My Enrolled",
      icon: GraduationCap,
      href: "/enrolled",
      protected: true,
    },
    {
      label: "Create",
      icon: PlusCircle,
      href: "/create",
      premium: true,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="transition-colors hover:bg-slate-100 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[85%] flex-col p-6 sm:w-[400px]">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-left">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo.png"
                alt="StudyZap Logo"
                width={40}
                height={40}
                className="rounded-xl shadow-lg"
              />
              <span className="text-xl font-bold tracking-tight">StudyZap</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-8">
          {user && (
            <div className="flex flex-col gap-4">
              <h2 className="text-muted-foreground px-2 text-xs font-bold tracking-widest uppercase">Account</h2>
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <UserAvatar user={user} className="border-primary/10 h-12 w-12 border-2" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-base font-bold">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h2 className="text-muted-foreground px-2 text-xs font-bold tracking-widest uppercase">Navigation</h2>
            <nav className="flex flex-col gap-1.5">
              {routes.map((route) => {
                if (route.protected && !user) return null;
                const isActive = pathname === route.href;

                return (
                  <Link
                    key={`${`${typeof route.href === "string" ? route.href : route.href.pathname}-${route.label}`}-${route.label}`}
                    href={route.href}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-12 w-full justify-start rounded-xl px-4 transition-all",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/20 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-slate-50",
                        route.premium && "text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                      )}
                    >
                      <route.icon
                        className={cn("mr-3 h-5 w-5", route.premium && !isActive && "text-purple-500")}
                      />
                      {route.label}
                      {route.premium && <Sparkles className="ml-auto h-3 w-3 text-purple-400" />}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto flex flex-col gap-4 pt-6">
            <Separator />
            {user ? (
              <div className="px-2">
                <SignOutButton as="button" />
              </div>
            ) : (
              <Link href="/auth/sign-in">
                <Button className="h-12 w-full rounded-xl font-bold shadow-md" variant="default">
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
