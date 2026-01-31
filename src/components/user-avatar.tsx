import type { User } from "better-auth";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "./auth-buttons";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function UserAvatar({ user, className }: { user: User; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className={className}>
          <AvatarFallback>CS</AvatarFallback>
          <AvatarImage src={user.image ?? ""} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/enrolled">My Enrolled Courses</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/created">My Created Courses</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton as="menu-item" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
