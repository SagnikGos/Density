// src/components/UserAuthDisplay.tsx
"use client"; // This is a client component

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Assuming shadcn/ui DropdownMenu
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn/ui Avatar
import { LogIn, LogOut, UserCircle, Github, ChromeIcon } from "lucide-react"; // Icons

/**
 * UserAuthDisplay component handles the presentation of authentication status and actions.
 * It shows login buttons if the user is not authenticated, or user information
 * and a logout button if they are authenticated.
 */
const UserAuthDisplay = () => {
  const { data: session, status } = useSession(); // Get session data and status

  // Loading state while session status is being determined
  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  // If the user is authenticated
  if (session && session.user) {
    const userName = session.user.name;
    const userEmail = session.user.email;
    const userImage = session.user.image;

    // Fallback initials for Avatar if no name/image
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
          {/* Add links to profile, settings, etc. here if needed */}
          {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
          {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}> {/* Redirect to home after sign out */}
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If the user is not authenticated
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("google", { callbackUrl: '/' })} // Specify provider and optional callback URL
      >
        <ChromeIcon className="mr-2 h-4 w-4" /> {/* Using a generic Chrome icon for Google */}
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
      {/* You can add a general sign-in button that takes users to the default NextAuth.js sign-in page */}
      {/* <Button variant="default" size="sm" onClick={() => signIn(undefined, { callbackUrl: '/' })}>
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button> */}
    </div>
  );
};

export default UserAuthDisplay;
