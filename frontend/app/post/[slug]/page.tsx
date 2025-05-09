// src/app/post/[slug]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // To get route parameters like [slug]
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button'; // For a potential like button
import { Heart, MessageCircle } from 'lucide-react'; // Icons
import { format } from 'date-fns'; // For formatting dates

// Re-using interfaces from AllPostsPage for consistency
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
  createdAt: string;
  updatedAt: string;
  // Add comments count or comments array if your API provides it
  // commentsCount?: number;
}

const SinglePostPage = () => {
  const params = useParams(); // Hook to access dynamic route parameters
  const slug = params?.slug as string; // Type assertion for slug

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add state for likes if you implement live liking
  // const [currentLikes, setCurrentLikes] = useState(0);

  useEffect(() => {
    if (!slug) {
      // Slug is not yet available (e.g., during initial render or if params are missing)
      // You might want to set loading true or handle this case appropriately
      setIsLoading(true);
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch post (Status: ${response.status})`);
        }
        const data: Post = await response.json();
        setPost(data);
        // setCurrentLikes(data.likes?.length || 0);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching the post.');
        console.error(`Error fetching post with slug "${slug}":`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]); // Re-run effect if slug changes

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading post content...</p>
        {/* You can add a more sophisticated skeleton loader here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500 text-xl">Error: {error}</p>
        <Link href="/posts" legacyBehavior>
          <a className="mt-4 inline-block text-primary hover:underline">
            Back to all posts
          </a>
        </Link>
      </div>
    );
  }

  if (!post) {
    // This case should ideally be covered by the error state if API returns 404
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl">Post not found.</p>
        <Link href="/posts" legacyBehavior>
          <a className="mt-4 inline-block text-primary hover:underline">
            Back to all posts
          </a>
        </Link>
      </div>
    );
  }

  // For rendering markdown content, you'd typically use a library like react-markdown
  // For now, we'll render it directly within a pre tag or div.
  // Example:
  // import ReactMarkdown from 'react-markdown';
  // <ReactMarkdown>{post.content}</ReactMarkdown>

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center leading-tight font-pt-sans">
          {post.title}
        </h1>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-muted-foreground text-sm">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorId?.avatar || undefined} alt={post.authorId?.name || post.authorId?.username} />
              <AvatarFallback>
                {post.authorId?.name ? post.authorId.name.substring(0, 2) : (post.authorId?.username ? post.authorId.username.substring(0, 2) : 'AU')}
              </AvatarFallback>
            </Avatar>
            <span>By {post.authorId?.name || post.authorId?.username || 'Unknown Author'}</span>
          </div>
          <span>&bull;</span>
          <span>Published on {format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
          {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
             <span>&bull; Updated on {format(new Date(post.updatedAt), 'MMMM d, yyyy')}</span>
          )}
        </div>
      </header>

      {/* Post Content - Rendered as pre-formatted text for now */}
      {/* Replace this with a Markdown renderer for rich text */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none mx-auto leading-relaxed"
        // Using dangerouslySetInnerHTML is generally not recommended without sanitization
        // if the content comes from users and isn't already sanitized.
        // For Markdown, use a dedicated renderer.
      >
        {/* For simple text or if you plan to use a Markdown component: */}
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>


      {/* Post Footer - Tags and Actions */}
      <footer className="mt-12 pt-8 border-t">
        {post.tags && post.tags.length > 0 && (
          <div className="mb-6">
            <span className="font-semibold mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <Link href={`/tag/${tag}`} key={tag} legacyBehavior>
                <a className="mr-2">
                  <Badge variant="secondary">{tag}</Badge>
                </a>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-6 text-muted-foreground">
          <Button variant="ghost" size="sm" /* onClick={handleLike} - Implement later */ >
            <Heart className="mr-2 h-4 w-4" />
            <span>{post.likes?.length || 0} Likes</span>
          </Button>
          {/* Placeholder for comments count/link */}
          {/* <Link href={`/post/${post.slug}#comments`} legacyBehavior>
            <a className="flex items-center hover:text-primary">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>{post.commentsCount || 0} Comments</span>
            </a>
          </Link> */}
        </div>
      </footer>

      {/* Placeholder for Comments Section - To be implemented later */}
      {/* <section id="comments" className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Comments</h2>
        {/* Comment form and list of comments will go here */}
      {/* </section> */}

    </article>
  );
};

export default SinglePostPage;
