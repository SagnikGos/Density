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

interface UserAuthDisplayProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

const UserAuthDisplay: React.FC<UserAuthDisplayProps> = ({
  isMobile,
  closeMobileMenu,
}) => {
  const { data: session, status } = useSession();

  const handleSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return <UserCircle className="w-5 h-5" />;
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (status === "loading") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={isMobile ? "w-full" : ""}
      >
        Loading...
      </Button>
    );
  }

  if (session && session.user) {
    const userName = session.user.name;
    const userEmail = session.user.email;
    const userImage = session.user.image;

    if (isMobile) {
      // Mobile logged-in view: Avatar + Name visible, acts as dropdown trigger
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-3 w-full p-3 rounded-md hover:bg-accent h-auto text-left"
            >
              <Avatar className="h-8 w-8">
                {userImage ? (
                  <AvatarImage src={userImage} alt={userName || "User avatar"} />
                ) : null}
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight truncate">
                  {userName || "User"}
                </span>
                {userEmail && (
                    <span className="text-xs text-muted-foreground leading-tight truncate">
                        {userEmail}
                    </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" forceMount>
            {/* Removed DropdownMenuLabel for mobile to avoid redundancy, email is now in trigger */}
            {/* You can add other mobile specific menu items here if needed */}
            {/* e.g., <DropdownMenuItem onClick={closeMobileMenu}>Profile</DropdownMenuItem> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Desktop logged-in view (original dropdown)
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
          {/* Add other desktop menu items if needed */}
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not Logged In state
  if (isMobile) {
    return (
      <div className="flex flex-col space-y-3 w-full">
        <Button
          variant="outline"
          size="lg" // Larger for easier tap on mobile
          onClick={() => handleSignIn("google")}
          className="w-full justify-center"
        >
          <ChromeIcon className="mr-2 h-5 w-5" />
          Sign in with Google
        </Button>
        <Button
          variant="outline"
          size="lg" // Larger for easier tap on mobile
          onClick={() => handleSignIn("github")}
          className="w-full justify-center"
        >
          <Github className="mr-2 h-5 w-5" />
          Sign in with GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSignIn("google")}
      >
        <ChromeIcon className="mr-2 h-4 w-4" />
        Sign in with Google
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSignIn("github")}
      >
        <Github className="mr-2 h-4 w-4" />
        Sign in with GitHub
      </Button>
    </div>
  );
};

export default UserAuthDisplay;