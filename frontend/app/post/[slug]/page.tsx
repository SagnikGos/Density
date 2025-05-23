// src/app/post/[slug]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, MessageCircle, Send, Loader2, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Interfaces (assuming these are defined as you provided)
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
}

interface CommentAuthor {
  _id: string;
  username: string;
  name?: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  postId: string;
  userId: CommentAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionUser extends Record<string, unknown> {
    id?: string;
    userId?: string;
    backendToken?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

const SinglePostPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { data: session, status: sessionStatus } = useSession();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [hasLikedPost, setHasLikedPost] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(0);
  const [isLikingPost, setIsLikingPost] = useState(false);

  const [infoNoteDialog, setInfoNoteDialog] = useState<{ isOpen: boolean; note: string }>({
    isOpen: false,
    note: '',
  });

  const typedSessionUser = session?.user as SessionUser | undefined;
  const currentUserId = typedSessionUser?.id;
  const backendToken = typedSessionUser?.backendToken;

  useEffect(() => {
    if (post && sessionStatus === 'authenticated' && currentUserId) {
      setHasLikedPost(post.likes.includes(currentUserId));
    } else if (post && sessionStatus !== 'loading' && !currentUserId) {
      setHasLikedPost(false);
    }
    if (post) {
      setCurrentLikeCount(post.likes?.length || 0);
    }
  }, [post, sessionStatus, currentUserId]);

  useEffect(() => {
    if (!slug) {
      setIsLoading(true);
      return;
    }
    const fetchPostDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${slug}`);
        if (!response.ok) {
          let errorData;
          try { errorData = await response.json(); } catch (e) { /* ignore */ }
          throw new Error(errorData?.message || `Failed to fetch post (Status: ${response.status})`);
        }
        const data: Post = await response.json();
        setPost(data);
        setCurrentLikeCount(data.likes?.length || 0);
        const sessionUserId = (session?.user as SessionUser | undefined)?.id;
        if (sessionStatus === 'authenticated' && sessionUserId) {
            setHasLikedPost(data.likes.includes(sessionUserId));
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching the post.');
        console.error(`Error fetching post with slug "${slug}":`, err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostDetails();
  }, [slug, sessionStatus, session]);

  const fetchCommentsForPost = async (postId: string) => {
    setIsFetchingComments(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments/${postId}`);
      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } catch (e) { /* ignore */ }
        throw new Error(errorData?.message || 'Failed to fetch comments.');
      }
      const commentsData: Comment[] = await response.json();
      setComments(commentsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCommentError(null);
    } catch (error: any) {
      setCommentError(error.message || 'Could not load comments.');
      console.error("Error fetching comments:", error);
    } finally {
      setIsFetchingComments(false);
    }
  };

  useEffect(() => {
    if (post?._id) {
      fetchCommentsForPost(post._id);
    }
  }, [post?._id]);

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }
    if (sessionStatus !== 'authenticated' || !currentUserId) {
      setCommentError("You must be logged in to comment.");
      return;
    }
    if (!backendToken) {
      setCommentError("Authentication token is missing. Please log in again.");
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backendToken}`,
        },
        body: JSON.stringify({ postId: post?._id, content: newComment }),
      });

      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } catch (e) { /* ignore */ }
        throw new Error(errorData?.message || `Failed to submit comment (Status: ${response.status})`);
      }
      
      const addedComment: Comment = await response.json();
      setNewComment('');
      setComments(prevComments => [addedComment, ...prevComments]);
      setCommentError(null);
    } catch (error: any) {
      setCommentError(error.message || 'An unexpected error occurred while posting comment.');
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeToggle = async () => {
    if (sessionStatus !== 'authenticated' || !currentUserId || !post) {
      setCommentError("You must be logged in to like a post.");
      return;
    }
    if (!backendToken) {
      setCommentError("Authentication token is missing for like action.");
      return;
    }

    setIsLikingPost(true);
    const originalHasLiked = hasLikedPost;
    const originalLikeCount = currentLikeCount;

    setHasLikedPost(!originalHasLiked);
    setCurrentLikeCount(originalHasLiked ? originalLikeCount - 1 : originalLikeCount + 1);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/like/${post._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${backendToken}`,
        },
      });

      const responseBody = await response.json(); // Read body once

      if (!response.ok) {
        setHasLikedPost(originalHasLiked);
        setCurrentLikeCount(originalLikeCount);
        const errorMessage = responseBody?.message || `Failed to update like status (Status: ${response.status})`;
        setCommentError(errorMessage);
        console.error("Error toggling like (API Error):", errorMessage);
        throw new Error(errorMessage);
      }

      if (responseBody.likes) {
        setCurrentLikeCount(responseBody.likes.length);
        setHasLikedPost(responseBody.likes.includes(currentUserId));
      }
      setCommentError(null); 

    } catch (error: any) {
      if (!commentError && error.message !== (post && (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/like/${post._id}`)).json())?.message) { 
       setCommentError(error.message || 'An unexpected error occurred while liking.');
      }
      console.error("Error toggling like (Catch Block):", error);
      if(hasLikedPost !== originalHasLiked) setHasLikedPost(originalHasLiked);
      if(currentLikeCount !== originalLikeCount) setCurrentLikeCount(originalLikeCount);
    } finally {
      setIsLikingPost(false);
    }
  };

  // Add click handler for info notes
  useEffect(() => {
    const handleInfoNoteClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('info-note')) {
        const note = target.getAttribute('data-note');
        if (note) {
          setInfoNoteDialog({ isOpen: true, note });
        }
      }
    };

    document.addEventListener('click', handleInfoNoteClick);
    return () => {
      document.removeEventListener('click', handleInfoNoteClick);
    };
  }, []);

  if (isLoading && !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-12 bg-muted rounded w-3/4 mx-auto mb-6"></div>
          <div className="h-7 bg-muted rounded w-1/2 mx-auto mb-12"></div>
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => <div key={i} className={`h-5 bg-muted rounded w-${i % 2 === 0 ? 'full' : '5/6'}`}></div>)}
            <div className="h-32 bg-muted rounded w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-xl mb-2">Error: {error}</p>
        <Link href="/posts" legacyBehavior>
          <a className="mt-4 inline-block text-primary hover:underline">
            &larr; Back to all posts
          </a>
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">Post not found.</p>
        <Link href="/posts" legacyBehavior>
          <a className="mt-4 inline-block text-primary hover:underline">
            &larr; Back to all posts
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* Base styles for rendered content area */
        .rendered-post-content .ProseMirror { /* In case content comes from a raw Tiptap export */
          padding: 0; 
        }

        /* Typography (matches editor styles) */
        .rendered-post-content h1 { font-size: 2.25rem; line-height: 1.2; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; letter-spacing: -0.025em; color: hsl(var(--foreground)); }
        .rendered-post-content h2 { font-size: 1.875rem; line-height: 1.25; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.5rem; letter-spacing: -0.025em; color: hsl(var(--foreground)); }
        .rendered-post-content h3 { font-size: 1.5rem; line-height: 1.3; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; letter-spacing: -0.025em; color: hsl(var(--foreground)); }
        .rendered-post-content p { font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.25rem; color: hsl(var(--foreground)); font-weight: 400; }
        .rendered-post-content ul, .rendered-post-content ol { padding-left: 1.75rem; margin-bottom: 1.5rem; font-size: 1.125rem; line-height: 1.8; color: hsl(var(--foreground)); }
        .rendered-post-content ol { list-style-type: decimal; }
        .rendered-post-content ul { list-style-type: disc; }
        .rendered-post-content li { margin-bottom: 0.5rem; display: list-item; } /* Ensure list item markers show */
        .rendered-post-content li > p { margin-bottom: 0.5rem; }

        /* Enhanced Blockquote Styling */
        .rendered-post-content blockquote {
          position: relative;
          border-left: 4px solid hsl(var(--primary)); 
          margin: 1.75rem 0; 
          font-style: italic; 
          color: hsl(var(--muted-foreground));
          background-color: hsl(var(--muted) / 0.5); /* 50% opacity of muted for background */
          padding: 1rem 1rem 1rem 2.5rem; /* Adjusted padding for icon */
          border-radius: 0.375rem;
        }
        .rendered-post-content blockquote::before {
          content: "“"; /* Quotation mark */
          font-family: serif; /* For a nicer quote mark */
          font-size: 3.5em; /* Larger quote mark */
          color: hsl(var(--primary)/0.5); /* Primary color with opacity */
          position: absolute;
          left: 0.5rem;
          top: -0.2rem; 
          line-height: 1;
          opacity: 0.8;
        }

        /* Inline Code Styling */
        .rendered-post-content code:not(pre > code) { 
          background-color: hsl(var(--muted)); 
          color: hsl(var(--muted-foreground)); 
          padding: 0.2em 0.4em; 
          border-radius: 0.25rem; 
          font-size: 0.9em;
          font-family: var(--font-mono, monospace);
        }

        /* Enhanced Code Block (pre) Styling */
        .rendered-post-content pre { 
          background-color: hsl(var(--card)) !important;
          color: hsl(var(--card-foreground)) !important;
          padding: 1.5rem 1.25rem !important;
          border-radius: 0.5rem !important;
          overflow-x: auto !important;
          margin: 1.75rem 0 !important;
          font-family: var(--font-mono, monospace) !important;
          font-size: 0.95rem !important;
          border: 3px solid #61450F !important;
          position: relative !important;
        }

        /* Dark mode styles */
        .dark .rendered-post-content pre {
          background-color: hsl(var(--muted) / 0.25) !important;
          border-color: #61450F !important;
        }

        .rendered-post-content pre::before {
          content: 'CODE';
          position: absolute;
          top: 10px;
          right: 12px;
          font-size: 0.65rem;
          font-weight: bold;
          letter-spacing: 0.05em;
          color: hsl(var(--primary));
          background-color: hsl(var(--card));
          padding: 1px 6px;
          border-radius: 3px;
          border: 1px solid hsl(var(--border));
        }
        
        /* Image Styling */
        .rendered-post-content img { max-width: 100%; height: auto; margin: 2rem auto; border-radius: 0.5rem; display: block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        
        /* Enhanced Link Styling */
        .rendered-post-content a { 
          color: hsl(var(--primary)); 
          text-decoration: underline; /* Standard text underline */
          text-underline-offset: 3px; /* Adjust space between text and underline */
          transition: color 0.2s ease, text-decoration-color 0.2s ease;
          cursor: pointer; 
        }
        .rendered-post-content a:hover { 
          color: hsl(var(--primary)/0.8); /* Slightly lighten/fade color on hover */
          text-decoration-color: hsl(var(--primary)/0.7); /* Slightly fade underline color on hover */
          /* text-decoration-thickness: 1.5px; */ /* Thicker underline on hover - browser support can be inconsistent */
        }
        
        /* Horizontal Rule Styling */
        .rendered-post-content hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 2.5rem 0; }

        /* Text Alignment Classes (if Tiptap exports these) */
        .rendered-post-content .text-left { text-align: left; } 
        .rendered-post-content .text-center { text-align: center; } 
        .rendered-post-content .text-right { text-align: right; } 
        .rendered-post-content .text-justify { text-align: justify; }

        /* Base for Highlight.js if used */
        .hljs { display: block; overflow-x: auto; /* Add your highlight.js theme colors here or link a theme stylesheet */ } 

        /* Info Note Styles */
        .info-note {
          border-bottom: 2px dotted hsl(var(--primary));
          cursor: pointer;
          position: relative;
          padding: 0.1em 0.3em;
          border-radius: 0.15em;
          transition: all 0.2s ease;
          background-color: hsl(var(--primary) / 0.05);
          color: hsl(var(--primary));
          font-weight: 500;
          display: inline-block;
          margin: 0 0.1em;
        }
        .info-note:hover {
          border-bottom-color: hsl(var(--primary) / 0.7);
          background-color: hsl(var(--primary) / 0.1);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px hsl(var(--primary) / 0.1);
        }
        .info-note:active {
          transform: translateY(0);
          box-shadow: none;
        }
        .info-note:focus {
          outline: 2px solid hsl(var(--primary) / 0.5);
          outline-offset: 2px;
        }
        .info-note:focus:not(:focus-visible) {
          outline: none;
        }
        .info-note::after {
          content: "i";
          position: absolute;
          top: 0.1em;
          right: -0.1em;
          font-style: italic;
          font-weight: bold;
          font-size: 0.75em;
          opacity: 0.7;
          transition: opacity 0.2s ease;
          line-height: 1;
        }
        .info-note:hover::after {
          opacity: 1;
        }
      `}</style>

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-center leading-tight text-foreground">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-2 text-muted-foreground text-sm mt-4">
            <div className="flex items-center gap-x-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={post.authorId?.avatar || undefined} alt={post.authorId?.name || post.authorId?.username} />
                <AvatarFallback>{post.authorId?.name ? post.authorId.name.substring(0, 2).toUpperCase() : (post.authorId?.username ? post.authorId.username.substring(0, 2).toUpperCase() : 'AU')}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground/90">{post.authorId?.name || post.authorId?.username || 'Unknown Author'}</span>
            </div>
            <span className="hidden sm:inline">&bull;</span>
            <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
            {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
              <><span className="hidden sm:inline">&bull;</span><span className="text-xs italic">(Updated {format(new Date(post.updatedAt), 'MMM d, yyyy')})</span></>
            )}
          </div>
        </header>

        <div
          className="rendered-post-content prose dark:prose-invert max-w-none" // prose classes handle base typography
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-12 pt-8 border-t border-border">
          {post.tags && post.tags.length > 0 && (
            <div className="mb-6">
              <span className="font-semibold mr-2 text-foreground">Tags:</span>
              {post.tags.map((tag) => (
                <Link href={`/tags/${tag}`} key={tag} legacyBehavior>
                  <a className="mr-1.5 mb-1.5 inline-block">
                    <Badge variant="secondary" className="hover:bg-primary/10 hover:text-primary transition-colors px-2.5 py-0.5 text-xs">{tag}</Badge>
                  </a>
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center space-x-4 text-muted-foreground">
            <Button 
                variant="ghost" 
                size="sm" 
                className="hover:text-primary group px-2" 
                onClick={handleLikeToggle} 
                disabled={isLikingPost || sessionStatus === 'loading' || (!post && isLoading)}
            >
              {isLikingPost ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`mr-1.5 h-4 w-4 group-hover:text-red-500 transition-colors ${hasLikedPost ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-500/20'}`} />
              )}
              <span>{currentLikeCount}</span><span className="ml-1 hidden xxs:inline">Like{currentLikeCount !== 1 ? 's' : ''}</span>
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="hover:text-primary group px-2" 
                onClick={() => {
                  const commentForm = document.getElementById('comment-form');
                  commentForm?.focus();
                  commentForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}>
              <MessageCircle className="mr-1.5 h-4 w-4"/>
              <span>{comments.length}</span><span className="ml-1 hidden xxs:inline">Comment{comments.length !== 1 ? 's' : ''}</span>
            </Button>
          </div>
          {commentError && (isLikingPost || commentError.toLowerCase().includes("like")) && (
            <p className="text-destructive text-sm mt-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1.5"/>{commentError}</p>
          )}
        </footer>

        <section id="comments" className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center">
            <MessageCircle className="mr-3 h-6 w-6 text-primary" />
            Comments ({comments.length})
          </h2>

          <form onSubmit={handleAddComment} className="mb-8 p-4 border border-border rounded-lg bg-card shadow">
            <Label htmlFor="comment-form" className="block text-sm font-medium text-foreground mb-1">
              Leave a comment
            </Label>
            <Textarea
              id="comment-form"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={sessionStatus === 'authenticated' ? "Write your thoughts..." : "Log in to share your thoughts..."}
              rows={3}
              className="mb-3"
              disabled={sessionStatus !== 'authenticated' || isSubmittingComment}
            />
            {sessionStatus === 'authenticated' ? (
              <Button type="submit" disabled={isSubmittingComment || !newComment.trim()} className="w-full sm:w-auto">
                {isSubmittingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={() => {
                  const callbackUrl = router.asPath ? router.asPath : (typeof window !== "undefined" ? window.location.pathname : "/");
                  router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
                }} 
                className="w-full sm:w-auto"
              >
                Log in to Comment
              </Button>
            )}
            {commentError && !isLikingPost && !commentError.toLowerCase().includes("like") && (
                <p className="text-destructive text-sm mt-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1.5"/>{commentError}</p>
            )}
          </form>

          {isFetchingComments && !comments.length && (
            <div className="space-y-4">
              {[...Array(2)].map((_,i) => (
                <div key={i} className="p-4 border border-border rounded-lg bg-card shadow animate-pulse">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-muted mr-3"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded ml-auto"></div>
                  </div>
                  <div className="h-3 w-full bg-muted rounded mb-1"></div>
                  <div className="h-3 w-5/6 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          )}

          {!isFetchingComments && comments.length === 0 && !commentError && (
            <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to share your thoughts!</p>
          )}
          
          {!isFetchingComments && comments.length === 0 && commentError && !isSubmittingComment && !isLikingPost && !commentError.toLowerCase().includes("like") && (
             <p className="text-destructive text-sm mt-2 text-center flex items-center justify-center"><AlertCircle className="w-4 h-4 mr-1.5"/>{commentError}</p>
          )}

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="p-4 border border-border rounded-lg bg-card shadow-sm relative">
                <div className="flex items-start">
                  <Avatar className="h-9 w-9 mr-3 mt-1 flex-shrink-0">
                    <AvatarImage src={comment.userId?.avatar || undefined} alt={comment.userId?.username || 'User avatar'} />
                    <AvatarFallback>{comment.userId?.name ? comment.userId.name.substring(0, 2).toUpperCase() : (comment.userId?.username ? comment.userId.username.substring(0, 2).toUpperCase() : 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 gap-x-2">
                      <span className="font-semibold text-sm text-foreground truncate" title={comment.userId?.name || comment.userId?.username || 'User'}>
                        {comment.userId?.name || comment.userId?.username || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0" title={format(new Date(comment.createdAt), 'MMMM d, yyyy HH:mm')}>
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
      <InfoNoteDialog
        isOpen={infoNoteDialog.isOpen}
        onClose={() => setInfoNoteDialog({ isOpen: false, note: '' })}
        note={infoNoteDialog.note}
      />
    </>
  );
};

// Add InfoNoteDialog component
const InfoNoteDialog = ({ isOpen, onClose, note }: { isOpen: boolean; onClose: () => void; note: string }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Note</DialogTitle>
        </DialogHeader>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-foreground whitespace-pre-wrap break-all overflow-hidden">
            <div className="w-full break-words leading-relaxed">
              {note}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SinglePostPage;