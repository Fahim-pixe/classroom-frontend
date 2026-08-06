"use client";

import { useState } from "react";
import {
  useRegister,
  useRefineOptions,
  useLink,
  useNotification,
} from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InputPassword } from "@/components/refine-ui/form/input-password";
import { cn } from "@/lib/utils";

export const SignUpForm = () => {
  const [name, setName] = useState(""); // <-- Added Name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { open } = useNotification();
  const Link = useLink();
  const { title } = useRefineOptions();
  const { mutate: register } = useRegister();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      open?.({
        type: "error",
        message: "Passwords don't match",
        description: "Please make sure both password fields contain the same value.",
      });
      return;
    }

    // Pass name, email, password, and default role to the register mutation
    register({
      name,
      email,
      password,
      role: "admin", // Automatically register as admin so you aren't blocked!
    });
  };

  return (
    <div className={cn("flex", "flex-col", "items-center", "justify-center", "px-6", "py-8", "min-h-svh")}>
      <Card className={cn("sm:w-[456px]", "p-12", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle className={cn("text-green-600", "dark:text-green-400", "text-3xl", "font-semibold")}>
            Sign up (Admin Portal)
          </CardTitle>
          <CardDescription className={cn("text-muted-foreground", "font-medium")}>
            Create your administrator account.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className={cn("px-0")}>
          <form onSubmit={handleSignUp}>
            {/* Added Name Input Field */}
            <div className={cn("flex", "flex-col", "gap-2", "mt-4")}>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Fahim"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={cn("flex", "flex-col", "gap-2", "mt-4")}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className={cn("relative", "flex", "flex-col", "gap-2", "mt-4")}>
              <Label htmlFor="password">Password</Label>
              <InputPassword
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={cn("relative", "flex", "flex-col", "gap-2", "mt-4")}>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <InputPassword
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className={cn("w-full", "mt-6", "bg-green-600", "hover:bg-green-700", "text-white")}
            >
              Sign up as Admin
            </Button>
          </form>
        </CardContent>
        <Separator />
        <CardFooter>
          <div className={cn("w-full", "text-center text-sm", "mt-4")}>
            <span className={cn("text-muted-foreground")}>Have an account? </span>
            <Link to="/login" className={cn("text-blue-600", "font-semibold", "underline")}>
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

SignUpForm.displayName = "SignUpForm";