// src/app/posts/page.tsx (or src/app/page.tsx if this is your homepage)
"use client"; // If fetching data client-side or using hooks like useEffect/useState

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // For displaying tags
import { format } from 'date-fns'; // For formatting dates (npm install date-fns)

// Define an interface for the Post structure, including author details
interface Author {
  _id: string;
  username: string;
  name?: string; // Full name from OAuth
  avatar?: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string; // Or a snippet if you prefer for the list view
  tags: string[];
  authorId: Author; // Changed from string to Author object
  likes: string[]; // Assuming likes is an array of user IDs
  createdAt: string;
  updatedAt: string;
}

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
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch posts (Status: ${response.status})`);
        }
        const data: Post[] = await response.json();
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading posts...</p>
        {/* You can add a spinner component here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No posts found yet. Be the first to create one!</p>
        <Link href="/create-post" legacyBehavior>
          <a className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90">
            Create Post
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center font-pt-sans">Latest Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post._id} className="flex flex-col">
            <CardHeader>
              <Link href={`/post/${post.slug}`} legacyBehavior>
                <a className="hover:underline">
                  <CardTitle className="text-2xl font-semibold font-pt-sans leading-tight">
                    {post.title}
                  </CardTitle>
                </a>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.authorId?.avatar || undefined} alt={post.authorId?.name || post.authorId?.username} />
                  <AvatarFallback>
                    {post.authorId?.name ? post.authorId.name.substring(0, 2) : (post.authorId?.username ? post.authorId.username.substring(0, 2) : 'U')}
                  </AvatarFallback>
                </Avatar>
                <span>{post.authorId?.name || post.authorId?.username || 'Unknown Author'}</span>
                <span>&bull;</span>
                <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Simple content preview - you might want to truncate or use a summary field */}
              <p className="text-muted-foreground line-clamp-3">
                {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">
                    {post.likes?.length || 0} likes
                </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllPostsPage;
