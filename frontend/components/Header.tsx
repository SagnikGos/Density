// src/components/Header.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Next.js Image component
import UserAuthDisplay from "./UserAuthDisplay"; // Import the component
import { NewspaperIcon, PencilSquareIcon } from "@heroicons/react/24/outline"; // Import icons

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src="/density-logo.png" // The path to your logo in the public folder
            alt="Density Logo" // Add a descriptive alt text
            width={80} // Specify the width of your logo
            height={20} // Specify the height of your logo
            className="h-auto" // You might want to adjust styling for responsiveness
            priority // Add priority if it's LCP
          />
        </Link>

        {/* Navigation and User Auth moved to the right */}
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/posts"
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <NewspaperIcon className="mr-1.5 h-5 w-5 sm:mr-2 sm:h-5 sm:w-5" />
              Posts
            </Link>
            <Link
              href="/create-post"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <PencilSquareIcon className="mr-1.5 h-5 w-5 sm:mr-2 sm:h-5 sm:w-5" />
              Write
            </Link>
          </nav>
          <UserAuthDisplay /> {/* Add the auth display component here */}
        </div>
      </div>
    </header>
  );
};

export default Header;