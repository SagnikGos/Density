import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <defs>
              <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl font-pt-sans bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60 pb-2">
              Density
            </h1>
            <p className="mt-4 text-xl md:text-2xl font-medium text-muted-foreground">
              Where ideas find their weight
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Express yourself through elegant writing, build an audience, 
              and join a community of thoughtful readers and creators.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/create-post">Start Writing</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-full px-8">
                <Link href="/posts">Explore Posts</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>  

      

      
    </div>
  );
}



