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
  const [name, setName] = useState("");
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

    // Standard Better Auth registration payload (name, email, password)
    register({
      name,
      email,
      password,
    });
  };

  return (
    <div className={cn("auth-shell", "flex", "flex-col", "items-center", "justify-center", "px-4", "py-6", "sm:px-6", "sm:py-8")}>
      <Card className={cn("auth-card", "w-full", "max-w-md", "p-6", "sm:p-10", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle className={cn("text-primary", "text-3xl", "font-semibold")}>
            Sign up (Admin Portal)
          </CardTitle>
          <CardDescription className={cn("text-muted-foreground", "font-medium")}>
            Create your administrator account.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className={cn("px-0")}>
          <form onSubmit={handleSignUp}>
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
              className={cn("w-full", "mt-6")}
            >
              Sign up
            </Button>
          </form>
        </CardContent>
        <Separator />
        <CardFooter>
          <div className={cn("w-full", "text-center text-sm", "mt-4")}>
            <span className={cn("text-muted-foreground")}>Have an account? </span>
            <Link to="/login" className={cn("text-primary", "font-semibold", "underline")}>
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

SignUpForm.displayName = "SignUpForm";