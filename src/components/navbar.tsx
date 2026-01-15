import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getServerSession } from "@/lib/auth";
import { SignOutButton } from "./auth-buttons";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export async function Navbar() {
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>CS</AvatarFallback>
                <AvatarImage src={session.user.image ?? ""} />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
              <SignOutButton />
            </DropdownMenuContent>
          </DropdownMenu>
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
