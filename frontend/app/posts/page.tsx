// src/app/posts/page.tsx (or src/app/page.tsx if this is your homepage)
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';

interface Author {
  _id: string;
  username: string;
  name?: string;
  avatar?: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  authorId: Author;
  likes: string[];
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

const stripHtml = (html: string): string => {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }
  return html.replace(/<[^>]+>/g, ''); 
};


const SkeletonCard = () => (
  <Card className="flex flex-col animate-pulse">
    <CardHeader className="pb-4">
      <div className="h-6 bg-muted rounded w-3/4 mb-3"></div> {/* Title */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-1">
        <div className="h-8 w-8 bg-muted rounded-full"></div> {/* Avatar */}
        <div className="h-4 bg-muted rounded w-24"></div> {/* Author Name */}
        <div className="h-4 bg-muted rounded w-16 ml-auto"></div> {/* Date */}
      </div>
    </CardHeader>
    <CardContent className="flex-grow pt-0 pb-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full"></div> {/* Content Line */}
        <div className="h-4 bg-muted rounded w-full"></div> {/* Content Line */}
        <div className="h-4 bg-muted rounded w-5/6"></div> {/* Content Line */}
      </div>
    </CardContent>
    <CardFooter className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 pb-4 border-t px-5"> {/* Removed explicit bg for footer */}
      <div className="flex flex-wrap gap-1.5">
        <div className="h-5 w-16 bg-muted rounded-full"></div> {/* Tag */}
        <div className="h-5 w-20 bg-muted rounded-full"></div> {/* Tag */}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
            <div className="h-4 w-4 bg-muted rounded"></div> {/* Icon */}
            <div className="h-4 bg-muted rounded w-6"></div> {/* Count */}
        </div>
        <div className="flex items-center space-x-1">
            <div className="h-4 w-4 bg-muted rounded"></div> {/* Icon */}
            <div className="h-4 bg-muted rounded w-6"></div> {/* Count */}
        </div>
      </div>
    </CardFooter>
  </Card>
);

const AllPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`);
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            throw new Error(response.statusText || `Failed to fetch posts (Status: ${response.status})`);
          }
          throw new Error(errorData.message || `Failed to fetch posts (Status: ${response.status})`);
        }
        const data: Post[] = await response.json();
        // Ensure backend sends authorId populated and commentsCount
        console.log("Fetched posts from backend:", data); 
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching posts.');
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const processedPosts = useMemo(() => {
    return posts.map(post => ({
      ...post,
      plainTextSnippet: stripHtml(post.content).substring(0, 150) + (stripHtml(post.content).length > 150 ? '...' : ''),
    }));
  }, [posts]);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 bg-muted rounded w-1/2 mx-auto mb-10 animate-pulse"></div>
        <div className="grid gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => <SkeletonCard key={index} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive text-lg">Error: {error}</p>
        <p className="text-muted-foreground mt-2">Please try refreshing the page or check back later.</p>
      </div>
    );
  }

  if (processedPosts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-muted-foreground mb-4">No Posts Yet!</h2>
        <p className="text-muted-foreground mb-6">It looks a bit empty here. Why not be the first to share your story?</p>
        <Link href="/create-post" legacyBehavior>
          <a className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
            Create Your First Post
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-center text-foreground">Latest Posts</h1>
      <div className="grid gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {processedPosts.map((post) => (
          <Card key={post._id} className="flex flex-col pb-0 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="pb-4">
              <Link href={`/post/${post.slug}`} legacyBehavior>
                <a className="group">
                  <CardTitle className="text-xl font-semibold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </a>
              </Link>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={post.authorId?.avatar || undefined} alt={post.authorId?.name || post.authorId?.username} />
                  <AvatarFallback className="text-xs">
                    {post.authorId?.name ? post.authorId.name.substring(0, 2).toUpperCase() : (post.authorId?.username ? post.authorId.username.substring(0, 2).toUpperCase() : 'AU')}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground/80 truncate" title={post.authorId?.name || post.authorId?.username || 'Unknown Author'}>
                    {post.authorId?.name || post.authorId?.username || 'Unknown Author'}
                </span>
                <span>&bull;</span>
                <span className="whitespace-nowrap">{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-0 pb-4">
              <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed">
                {post.plainTextSnippet}
              </p>
            </CardContent>
          
            <CardFooter className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 pb-4 border-t dark:bg-slate-800/30 px-5">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags && post.tags.length > 0 && post.tags.slice(0, 2).map((tag) => (
                    <Link href={`/tags/${tag}`} key={tag} legacyBehavior>
                      <a>
                        <Badge variant="secondary" className="text-xs hover:bg-primary/10 hover:text-primary transition-colors">{tag}</Badge>
                      </a>
                    </Link>
                  ))}
                  {post.tags && post.tags.length > 2 && (
                     <Badge variant="outline" className="text-xs">+{post.tags.length - 2} more</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center" title={`${post.likes?.length || 0} likes`}>
                        <Heart className="h-3.5 w-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                        <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center" title={`${post.commentsCount || 0} comments`}>
                        <MessageCircle className="h-3.5 w-3.5 mr-1 text-slate-500 dark:text-slate-400" />
                       
                        <span>{post.commentsCount || 0}</span>
                    </div>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllPostsPage;

