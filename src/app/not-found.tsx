import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="mx-auto max-w-md text-center">
          <div className="relative mb-8 inline-flex">
            <div className="bg-primary/10 absolute -inset-4 rounded-full blur-2xl transition-all" />
            <div className="bg-background border-primary/20 relative flex h-24 w-24 items-center justify-center rounded-3xl border-2 shadow-xl">
              <FileQuestion className="text-primary h-12 w-12" />
            </div>
            <div className="bg-accent border-background absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-black shadow-lg">
              404
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">Page not found</h1>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            Oops! It looks like you&apos;ve zapped into void. The page you&apos;re looking for doesn&apos;t exist
            or has been moved.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="flex-1">
              <Button className="h-12 w-full rounded-xl font-bold transition-all active:scale-[0.98]">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/explore" className="flex-1">
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                <Search className="mr-2 h-4 w-4" />
                Explore Courses
              </Button>
            </Link>
          </div>

          <div className="mt-12">
            <p className="text-muted-foreground text-sm">
              Lost?{" "}
              <Link href="/" aria-disabled className="text-primary font-medium hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Subtle Background Elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/5 absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>
    </div>
  );
}
