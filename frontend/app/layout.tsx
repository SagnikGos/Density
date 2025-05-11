// src/app/layout.tsx
import type { Metadata } from "next";
import { Nunito, PT_Sans } from "next/font/google";
import "./globals.css"; // Your global styles, including Matsu UI and Tailwind
import Providers from "@/components/Providers"; // Import the Providers component
import Header from "@/components/Header";

// Initialize Nunito font
const nunito = Nunito({
  variable: "--font-nunito", // CSS variable for easy use in Tailwind
  subsets: ["latin"],        // Specify character subsets
  display: 'swap',           // Improves font loading performance
});

// Initialize PT Sans font
const ptSans = PT_Sans({
  variable: "--font-pt-sans", // CSS variable
  subsets: ["latin"],
  weight: ["400", "700"],    // Specify font weights
  display: 'swap',
});

// Metadata for the application (SEO and browser information)
export const metadata: Metadata = {
  title: "Density", // Update with your app's title
  description: "Densify Your Thoughts. Amplify Your Reach.",
  //icon
  icons: {
    icon: "/density-favicon.ico", // Path to your favicon or app icon
    shortcut: "/density-favicon.png", // Path to a shortcut icon
    apple: "/density-favicon.png", // Path to an Apple touch icon
  },
  // Update description
  // Add other metadata like icons, open graph tags, etc.
};

/**
 * RootLayout is the main layout component for the entire application.
 * It sets up the HTML structure, applies global fonts, and wraps children
 * with necessary context providers (like Auth.js SessionProvider).
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The page content to be rendered within the layout.
 * @returns {JSX.Element} The RootLayout component.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning can be useful with client providers */}
      <body
        className={`${nunito.variable} ${ptSans.variable} font-nunito antialiased relative bg-background text-foreground`}
      >
        {/* The Providers component wraps children with SessionProvider for NextAuth.js */}
        <Providers>
          <Header /> {/* Header component for navigation and auth display */}
          {/* The texture div for Matsu UI styling. Ensure its CSS is in globals.css */}
          <div className="texture" />
          {/*
            You might want to add a common header/navbar and footer component here,
            outside the main {children} rendering if they are part of every page.
            Example:
            <Header />
          */}
          <main className="flex-grow"> {/* Ensures content pushes footer down if body is flex col */}
            {children} {/* This is where your page content will be rendered */}
          </main>
          {/*
            Example:
            <Footer />
          */}
        </Providers>
      </body>
    </html>
  );
}
