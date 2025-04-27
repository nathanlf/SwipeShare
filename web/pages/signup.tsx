import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useQueryClient } from "@tanstack/react-query";
import { Soup, AtSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner"


export default function Signup() {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const queryClient = useQueryClient();
  // Create states for each field in the form.
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, handle } },
    });
    if (error) {
      console.error(error);
      toast(error.message)

    }
    queryClient.resetQueries({ queryKey: ["user_profile"] });

    if (error) return;
    router.push('/welcome');
    // ... your implementation here ...
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
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <Soup className="size-6" />
                </div>
              </a>
              <h1 className="text-xl font-bold">Welcome to SwipeShare</h1>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Log in here!
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
                <Label htmlFor="name">Name</Label>
                <Input
                  className="text-accent1 placeholder:text-accent1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sample Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Handle</Label>
                <div className="relative">
                  <AtSign className="absolute left-2 top-2.5 h-4 w-4 text-accent1" />
                  <Input
                    className="text-accent1 placeholder:text-accent1 pl-8"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="ramses"
                    required
                  />
                </div>
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
                className="w-full bg-[#3bbf90cc] hover:bg-accent1"
                onClick={signUp}
              >
                Sign Up
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
