"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import { useTheme } from 'next-themes';

// Import createLowlight and individual languages
import { createLowlight } from 'lowlight';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';

import {
  Bold, Italic, Strikethrough, Code, Pilcrow, List, ListOrdered, Quote, Link as LinkIcon,
  Image as ImageIcon, Code2, Undo, Redo, Minus, Clock, AlignLeft, AlignCenter, AlignRight, 
  Heading1, Heading2, Heading3, Save, Eye, ExternalLink
} from 'lucide-react';

// Create a lowlight instance
const lowlight = createLowlight();
lowlight.register({ html, css, javascript, typescript, python, java, csharp, php });

const TipTapMenuBar = ({ editor }: { editor: any }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const buttonClasses = "p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const activeClasses = "bg-primary/10 text-primary hover:bg-primary/20";
  const inactiveClasses = "text-foreground/70 hover:text-foreground hover:bg-muted/60";

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 mb-2 rounded-t-md">
      {/* Undo/Redo */}
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${buttonClasses} ${inactiveClasses}`}> <Undo className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${buttonClasses} ${inactiveClasses}`}> <Redo className="h-4 w-4" /> </Button>
      <div className="h-6 border-l border-border/60 mx-1"></div>

      {/* Headings */}
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${buttonClasses} ${editor.isActive('heading', { level: 1 }) ? activeClasses : inactiveClasses}`}> <Heading1 className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${buttonClasses} ${editor.isActive('heading', { level: 2 }) ? activeClasses : inactiveClasses}`}> <Heading2 className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${buttonClasses} ${editor.isActive('heading', { level: 3 }) ? activeClasses : inactiveClasses}`}> <Heading3 className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setParagraph().run()} className={`${buttonClasses} ${editor.isActive('paragraph') ? activeClasses : inactiveClasses}`}> <Pilcrow className="h-4 w-4" /> </Button>
      <div className="h-6 border-l border-border/60 mx-1"></div>
      
      {/* Basic Marks */}
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={`${buttonClasses} ${editor.isActive('bold') ? activeClasses : inactiveClasses}`}> <Bold className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${buttonClasses} ${editor.isActive('italic') ? activeClasses : inactiveClasses}`}> <Italic className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} className={`${buttonClasses} ${editor.isActive('strike') ? activeClasses : inactiveClasses}`}> <Strikethrough className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleCode().run()} className={`${buttonClasses} ${editor.isActive('code') ? activeClasses : inactiveClasses}`}> <Code className="h-4 w-4" /> </Button>
      <div className="h-6 border-l border-border/60 mx-1"></div>

      {/* Lists & Blocks */}
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${buttonClasses} ${editor.isActive('bulletList') ? activeClasses : inactiveClasses}`}> <List className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${buttonClasses} ${editor.isActive('orderedList') ? activeClasses : inactiveClasses}`}> <ListOrdered className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${buttonClasses} ${editor.isActive('blockquote') ? activeClasses : inactiveClasses}`}> <Quote className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`${buttonClasses} ${editor.isActive('codeBlock') ? activeClasses : inactiveClasses}`}> <Code2 className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={`${buttonClasses} ${inactiveClasses}`}> <Minus className="h-4 w-4" /> </Button>
      <div className="h-6 border-l border-border/60 mx-1"></div>

      {/* Alignment */}
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`${buttonClasses} ${editor.isActive({ textAlign: 'left' }) ? activeClasses : inactiveClasses}`}> <AlignLeft className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`${buttonClasses} ${editor.isActive({ textAlign: 'center' }) ? activeClasses : inactiveClasses}`}> <AlignCenter className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`${buttonClasses} ${editor.isActive({ textAlign: 'right' }) ? activeClasses : inactiveClasses}`}> <AlignRight className="h-4 w-4" /> </Button>
      <div className="h-6 border-l border-border/60 mx-1"></div>
      
      {/* Link & Image */}
      <Button variant="ghost" size="icon" onClick={setLink} className={`${buttonClasses} ${editor.isActive('link') ? activeClasses : inactiveClasses}`}> <LinkIcon className="h-4 w-4" /> </Button>
      <Button variant="ghost" size="icon" onClick={addImage} className={`${buttonClasses} ${inactiveClasses}`}> <ImageIcon className="h-4 w-4" /> </Button>
    </div>
  );
};

const EditorStats = ({ editor }: { editor: any }) => {
  const [stats, setStats] = useState({ words: 0, chars: 0, readingTime: 0 });
  useEffect(() => {
    if (!editor) return;
    const updateStats = () => {
      const text = editor.getText();
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      const chars = text.length;
      const readingTime = Math.max(1, Math.ceil(words / 200));
      setStats({ words, chars, readingTime });
    };
    updateStats();
    editor.on('update', updateStats);
    return () => editor.off('update', updateStats);
  }, [editor]);

  if (!editor) return null;
  return (
    <div className="flex items-center text-xs text-muted-foreground mt-3 gap-4 px-1">
      <span>{stats.words} words</span>
      <span>{stats.chars} characters</span>
      <span className="flex items-center gap-1"> <Clock className="h-3 w-3" /> {stats.readingTime} min read </span>
    </div>
  );
};

const CreatePostPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        gapcursor: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[400px] w-full prose dark:prose-invert max-w-none',
      },
    },
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/api/auth/signin?callbackUrl=/create-post');
    }
  }, [status, router]);

  const handleSubmit = async () => {
    if (!editor) return;
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    const currentContent = editor.getHTML();

    if (!session?.user) {
      setError("You must be logged in to create a post.");
      setIsSubmitting(false);
      return;
    }
    const backendToken = (session.user as any)?.backendToken;
    if (!backendToken) {
      setError("Authentication token is missing. Please try logging out and in again.");
      setIsSubmitting(false);
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      setIsSubmitting(false);
      return;
    }
    if (editor.isEmpty) {
      setError("Content cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${backendToken}` },
        body: JSON.stringify({ title, content: currentContent, tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create post (Status: ${response.status})`);
      }
      const createdPost = await response.json();
      setSuccessMessage(`Post "${createdPost.title}" published successfully!`);
      // Redirect after a short delay to allow user to see success message
      setTimeout(() => {
        router.push(`/post/${createdPost.slug}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => () => editor?.destroy(), [editor]);

  // Render loading and auth states
  if (status === 'loading' || (status === 'authenticated' && !session?.user)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse p-4 rounded-md bg-muted/20">
          <p className="text-muted-foreground">Loading & Verifying Authentication...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-4 rounded-md bg-muted/20">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      {/* Global styles for TipTap editor content */}
      <style jsx global>{`
        .ProseMirror {
          padding: 1.5rem; /* More generous padding */
          outline: none !important;
          min-height: 70vh; /* Taller editor area, more like Medium */
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        /* Medium-inspired Typography */
        .ProseMirror h1 { 
          font-size: 2.25rem; 
          line-height: 1.2; 
          font-weight: 700; 
          margin-top: 2rem; 
          margin-bottom: 0.75rem; 
          letter-spacing: -0.025em;
          color: hsl(var(--foreground));
        }
        .ProseMirror h2 { 
          font-size: 1.875rem; 
          line-height: 1.25; 
          font-weight: 700; 
          margin-top: 1.75rem; 
          margin-bottom: 0.5rem; 
          letter-spacing: -0.025em;
          color: hsl(var(--foreground));
        }
        .ProseMirror h3 { 
          font-size: 1.5rem; 
          line-height: 1.3; 
          font-weight: 600; 
          margin-top: 1.5rem; 
          margin-bottom: 0.5rem; 
          letter-spacing: -0.025em;
          color: hsl(var(--foreground));
        }
        .ProseMirror p { 
          font-size: 1.125rem; /* Medium-like base font size */
          line-height: 1.8; /* Slightly more line height for better readability */
          margin-bottom: 1.25rem; 
          color: hsl(var(--foreground));
          font-weight: 400;
        }
        .ProseMirror ul, .ProseMirror ol { 
          padding-left: 1.75rem; 
          margin-bottom: 1.5rem; 
          font-size: 1.125rem; 
          line-height: 1.8;
        }
        .ProseMirror li { 
          margin-bottom: 0.5rem;
        }
        .ProseMirror li > p { 
          margin-bottom: 0.5rem; 
        }
        .ProseMirror blockquote { 
          border-left: 3px solid hsl(var(--primary)); 
          padding-left: 1rem; 
          margin: 1.5rem 0; 
          font-style: italic; 
          color: hsl(var(--muted-foreground));
          background-color: hsl(var(--muted)/30);
          padding: 1rem 1rem 1rem 1.5rem;
          border-radius: 0.375rem;
        }
        .ProseMirror code:not(pre > code) { 
          background-color: hsl(var(--muted)); 
          color: hsl(var(--muted-foreground)); 
          padding: 0.2em 0.4em; 
          border-radius: 0.25rem; 
          font-size: 0.9em;
          font-family: var(--font-mono, monospace);
        }
        .ProseMirror pre { 
          background-color: hsl(var(--card)); 
          color: hsl(var(--card-foreground)); 
          padding: 1rem; 
          border-radius: 0.5rem; 
          overflow-x: auto; 
          margin: 1.5rem 0; 
          font-family: var(--font-mono, monospace);
          font-size: 0.95rem;
          border: 1px solid hsl(var(--border));
        }
        .ProseMirror pre code { 
          background-color: transparent; 
          color: inherit; 
          padding: 0; 
          border-radius: 0; 
          font-size: inherit;
        }
        .ProseMirror img { 
          max-width: 100%; 
          height: auto; 
          margin: 2rem auto; 
          border-radius: 0.5rem; 
          display: block;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .ProseMirror a { 
          color: hsl(var(--primary)); 
          text-decoration: none; 
          border-bottom: 1px solid hsl(var(--primary)/40);
          transition: border-color 0.2s ease;
        }
        .ProseMirror a:hover { 
          border-bottom: 1px solid hsl(var(--primary));
        }
        .ProseMirror hr { 
          border: none; 
          border-top: 1px solid hsl(var(--border)); 
          margin: 2rem 0;
        }
        
        /* Medium-like focus states */
        .title-input, .tags-input {
          transition: border-color 0.2s ease;
        }
        .title-input:focus, .tags-input:focus {
          border-color: hsl(var(--primary));
        }
        
        /* Preview Mode */
        .preview-mode {
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
      `}</style>

      {/* Editor Header with Actions */}
      <div className="flex justify-between items-center mb-8 sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-3 px-1 -mx-1 rounded-md">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()} 
            className="text-muted-foreground"
          >
            ← Back
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-full p-1 flex shadow-sm">
            <Button
              type="button"
              variant={viewMode === 'edit' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="rounded-full px-3"
            >
              Edit
            </Button>
            <Button
              type="button"
              variant={viewMode === 'preview' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-full px-3"
            >
              Preview
            </Button>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !editor || !title.trim() || editor.isEmpty}
            className="px-4 gap-1.5 ml-2"
            size="sm"
          >
            {isSubmitting ? <Save className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Title and Tags Inputs */}
      <div className="space-y-3 mb-6">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full text-3xl sm:text-4xl font-bold border-0 border-b border-border/40 focus-visible:ring-0 focus-visible:border-primary title-input rounded-none px-0 h-auto py-3 placeholder:text-muted-foreground/50"
          placeholder="Your Story Title"
          disabled={viewMode === 'preview'}
        />
        <div className="relative">
          <Input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-sm border-0 focus-visible:ring-0 focus-visible:border-primary tags-input rounded-none px-0 h-auto py-2 placeholder:text-muted-foreground/50 text-muted-foreground"
            placeholder="Add tags separated by commas (e.g., tech, programming, lifestyle)"
            disabled={viewMode === 'preview'}
          />
          {tags && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.split(',').map((tag, i) => tag.trim()).filter(tag => tag).map((tag, i) => (
                <div key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor or Preview */}
      <div className={`bg-card rounded-lg border border-border shadow-sm overflow-hidden transition-all ${viewMode === 'preview' ? 'preview-mode ring-1 ring-primary/10' : ''}`}>
        {viewMode === 'edit' ? (
          <>
            <TipTapMenuBar editor={editor} />
            <div className="pb-3"> 
              <EditorContent editor={editor} />
            </div>
          </>
        ) : (
          <div className="prose dark:prose-invert max-w-none p-6">
            <h1>{title || 'Untitled Story'}</h1>
            {editor && <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />}
            {editor?.isEmpty && (
              <p className="text-muted-foreground italic">This story doesn't have any content yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Stats and Messages */}
      {editor && viewMode === 'edit' && <EditorStats editor={editor} />}

      {error && (
        <div className="mt-6 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-600 dark:text-green-400 text-sm">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default CreatePostPage;