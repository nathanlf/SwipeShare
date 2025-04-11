import { Soup } from "lucide-react";

import Link from "next/link";

import { Label } from "@/components/ui/label";

import { useState } from "react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-[calc(100svh-164px)] flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a href="#" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <Soup className="size-6" />
                </div>
              </a>
              <h1 className="text-xl font-bold">Log in to SwipeShare</h1>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/" className="underline underline-offset-4">Sign up here!</Link>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
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
              <Link href="/homepage">
                <Button className="w-full" >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
