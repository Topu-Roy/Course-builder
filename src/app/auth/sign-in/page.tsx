import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInWithGithubButton } from "@/components/auth-buttons";
import { getServerSession } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerSession();

  if (session) {
    return redirect("/");
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInWithGithubButton />
        </CardContent>
      </Card>
    </div>
  );
}
