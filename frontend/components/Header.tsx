    // src/components/Header.tsx
    import React from "react";
    import Link from "next/link";
    import UserAuthDisplay from "./UserAuthDisplay"; // Import the component

    const Header = () => {
      return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              {/* You can add a logo or site title here */}
              <span className="font-bold sm:inline-block text-lg font-pt-sans">
                Density
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              {/* Add other navigation links here if needed */}
              {/* <Link href="/latest" className="text-foreground/60 transition-colors hover:text-foreground/80">
                Latest
              </Link>
              <Link href="/tags" className="text-foreground/60 transition-colors hover:text-foreground/80">
                Tags
              </Link> */}
            </nav>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <UserAuthDisplay /> {/* Add the auth display component here */}
            </div>
          </div>
        </header>
      );
    };

    export default Header;
    