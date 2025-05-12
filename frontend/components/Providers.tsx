// src/components/Providers.tsx
"use client"; // This directive is crucial for client-side components in Next.js App Router

import { SessionProvider } from "next-auth/react";
import React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps): JSX.Element => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
