// src/app/page.tsx
import { Button } from "@/components/ui/button"; // Example shadcn/ui component
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-pt-sans">
        Welcome to YourBlog!
      </h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
        This is your new blogging platform, ready for amazing content.
        Explore, write, and share your thoughts with the world.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild size="lg">
          <Link href="/create-post">Create New Post</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/latest-posts">View Latest Posts</Link>
        </Button>
      </div>
    </div>
  );
}