"use client";

import { useMutation } from "@tanstack/react-query";
import { Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Spinner } from "./ui/spinner";

export function SignInWithGithubButton() {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider: "github",
      }),
  });

  function handleClick() {
    mutate(undefined, {
      onSuccess() {
        router.push("/");
      },
      onError() {
        toast.error("Something went wrong. Please try again.");
      },
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <Spinner />
      ) : (
        <>
          <Github />
          Sign In with GitHub
        </>
      )}
    </Button>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: () => authClient.signOut(),
  });

  function handleClick() {
    mutate(undefined, {
      onSuccess() {
        router.push("/");
      },
      onError() {
        toast.error("Something went wrong. Please try again.");
      },
    });
  }

  return (
    <DropdownMenuItem variant={"destructive"} onClick={handleClick} disabled={isPending}>
      {isPending ? <Spinner /> : "Sign Out"}
    </DropdownMenuItem>
  );
}
