"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, UserCircle, Github, ChromeIcon } from "lucide-react";

const UserAuthDisplay = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (session && session.user) {
    const userName = session.user.name;
    const userEmail = session.user.email;
    const userImage = session.user.image;

    const getInitials = (name: string | null | undefined) => {
      if (!name) return <UserCircle className="w-5 h-5" />;
      const names = name.split(" ");
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              {userImage ? (
                <AvatarImage src={userImage} alt={userName || "User avatar"} />
              ) : null}
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userName || "User"}
              </p>
              {userEmail && (
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("google", { callbackUrl: '/' })}
      >
        <ChromeIcon className="mr-2 h-4 w-4" />
        Sign in with Google
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("github", { callbackUrl: '/' })}
      >
        <Github className="mr-2 h-4 w-4" />
        Sign in with GitHub
      </Button>
    </div>
  );
};

export default UserAuthDisplay;

