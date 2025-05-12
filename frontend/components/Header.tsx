'use client';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UserAuthDisplay from "./UserAuthDisplay"; // Ensure this path is correct
import {
  NewspaperIcon,
  PencilSquareIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenuOnly = () => {
    setIsMobileMenuOpen(false);
  }

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenuOnly}>
          <Image
            src="/density-logo.png" // Make sure this path is correct in your public folder
            alt="Density Logo"
            width={80}
            height={20}
            className="h-auto"
            priority
          />
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden absolute right-4 z-60" // Increased z-index for toggle
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center gap-2">
            <Link
              href="/posts"
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <NewspaperIcon className="mr-2 h-5 w-5" />
              Posts
            </Link>
            <Link
              href="/create-post"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <PencilSquareIcon className="mr-2 h-5 w-5" />
              Write
            </Link>
          </nav>
          <UserAuthDisplay /> {/* For Desktop */}
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
              className="md:hidden absolute top-full left-0 w-full bg-background shadow-lg z-50" // z-index for overlay
            >
              <div className="flex flex-col p-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <Link
                  href="/posts"
                  onClick={toggleMobileMenu} // Close menu on navigation
                  className="flex items-center p-3 rounded-md hover:bg-accent text-foreground/90"
                >
                  <NewspaperIcon className="mr-3 h-6 w-6 flex-shrink-0" />
                  <span className="truncate">Posts</span>
                </Link>
                <Link
                  href="/create-post"
                  onClick={toggleMobileMenu} // Close menu on navigation
                  className="flex items-center p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <PencilSquareIcon className="mr-3 h-6 w-6 flex-shrink-0" />
                  <span className="truncate">Write</span>
                </Link>
                <hr className="border-border/40 my-2" />
                <div className="pt-2">
                  {/* Pass isMobile and closeMobileMenu props */}
                  <UserAuthDisplay isMobile={true} closeMobileMenu={toggleMobileMenu} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;