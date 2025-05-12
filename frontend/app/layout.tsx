// src/app/layout.tsx
import type { Metadata } from "next";
import { Nunito, PT_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: 'swap',
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Density",
  description: "Densify Your Thoughts. Amplify Your Reach.",
  icons: {
    icon: "/density-favicon.ico",
    shortcut: "/density-favicon.png",
    apple: "/density-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${ptSans.variable} font-nunito antialiased relative bg-background text-foreground`}>
        <Providers>
          <Header />
          <div className="texture" />
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

