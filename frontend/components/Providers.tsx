// src/components/Providers.tsx
"use client"; // This directive is crucial for client-side components in Next.js App Router

import { SessionProvider } from "next-auth/react";
import React from "react";

// Define the props for the Providers component
interface ProvidersProps {
  children: React.ReactNode;
  // You might pass a session object here if pre-fetching on the server,
  // but for basic setup, SessionProvider handles fetching.
  // session?: any; // Optional: if you pass server-side session
}

/**
 * Providers component to wrap the application with client-side context providers.
 * Currently, it only includes SessionProvider for NextAuth.js.
 * @param {ProvidersProps} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be wrapped.
 * @returns {JSX.Element} The Providers component.
 */
const Providers = ({ children }: ProvidersProps): JSX.Element => {
  // SessionProvider makes the session data available to all child components
  // via the `useSession` hook.
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
