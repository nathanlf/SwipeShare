import { Cookie, CupSoda, Sandwich, Soup } from "lucide-react";

import Link from "next/link";

import { Label } from "@/components/ui/label";

import { useState } from "react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();
  // Create states for each field in the form.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logIn = async () => {
    // ... your implementation here ...
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast("Uh oh! Something went wrong", {
        className: "!bg-red-600 !text-primary-foreground !border-none",
        descriptionClassName: "!text-primary-foreground",
        description: error.message,
      });
      /* toast("Uh oh! Something went wrong", {
         description: error.message,
       })*/
      console.error(error);
      return;
    }
    queryClient.resetQueries({ queryKey: ["user_profile"] });
    router.push("/");
  };

  return (
    <div className="flex min-h-[calc(100svh)] flex-col text-primary-foreground items-center justify-center gap-6 bg-primary1 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex flex-row gap-x-1 items-center justify-center rounded-md">
                  <Cookie />
                  <Sandwich />
                  <CupSoda />
                </div>
              </a>
              <div className="flex flex-row gap-x-1.5">
                <h1 className="text-xl font-bold">Log in to SwipeShare</h1>
                <Soup />
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up here!
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="text-accent1 placeholder:text-accent1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="janedoe@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                variant="default"
                className="w-full bg-[#3bbf90cc] hover:bg-accent1"
                onClick={logIn}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
