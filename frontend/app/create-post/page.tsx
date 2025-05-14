"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
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
  Heading1, Heading2, Heading3, Save, Eye, ExternalLink, X, UploadCloud
} from 'lucide-react';

// Create a lowlight instance
const lowlight = createLowlight();
lowlight.register({ html, css, javascript, typescript, python, java, csharp, php });

// Custom Link Modal Component
interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { url: string; text?: string }) => void;
  initialUrl?: string;
  initialText?: string;
  isTextSelected?: boolean;
}

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = '',
  initialText = '',
  isTextSelected = false,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [urlError, setUrlError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText);
      setUrlError(null);
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialUrl, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setUrlError('URL cannot be empty.');
      return;
    }
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('#') && !url.match(/^\w+:/)) {
      finalUrl = `https://${url}`;
    }
    try {
      new URL(finalUrl); // Validate URL
      setUrlError(null);
    } catch (_) {
      setUrlError('Invalid URL format.');
      return;
    }
    onSubmit({ url: finalUrl, text: isTextSelected ? undefined : text });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md border border-border">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {initialUrl ? 'Edit Link' : 'Add Link'}
            </h3>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="link-url" className="block text-sm font-medium text-muted-foreground mb-1">URL</label>
              <Input
                ref={urlInputRef}
                id="link-url"
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(null); }}
                placeholder="https://example.com"
                className={`w-full ${urlError ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
              />
              {urlError && <p className="text-xs text-destructive mt-1">{urlError}</p>}
            </div>
            {!isTextSelected && (
              <div>
                <label htmlFor="link-text" className="block text-sm font-medium text-muted-foreground mb-1">
                  Link Text (Optional)
                </label>
                <Input
                  id="link-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Defaults to URL if empty"
                  className="w-full"
                />
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialUrl && url.trim() === '' ? 'Remove Link' : 'Save Link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TipTapMenuBar = ({ editor }: { editor: any }) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalData, setLinkModalData] = useState<{ initialUrl: string; initialText: string; isTextSelected: boolean }>({
    initialUrl: '',
    initialText: '',
    isTextSelected: false,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  if (!editor) return null;

  const openLinkModal = useCallback(() => {
    const existingAttributes = editor.getAttributes('link');
    const { selection } = editor.state;
    const selectedText = selection.empty ? '' : editor.state.doc.textBetween(selection.from, selection.to, ' ');

    setLinkModalData({
      initialUrl: existingAttributes.href || '',
      initialText: selectedText || existingAttributes.href || '',
      isTextSelected: !selection.empty && !!selectedText,
    });
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleLinkModalSubmit = useCallback(({ url, text }: { url: string; text?: string }) => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const { state } = editor;
    const { selection } = state;
    const { empty, from, to } = selection;
    const linkAttributes = { href: url, target: '_blank', rel: 'noopener noreferrer nofollow' };

    if (empty && !text) {
      editor.chain().focus()
        .insertContentAt(from, [{ type: 'text', text: url, marks: [{ type: 'link', attrs: linkAttributes }] }])
        .setTextSelection({ from, to: from + url.length })
        .run();
    } else if (empty && text) {
      editor.chain().focus()
        .insertContentAt(from, [{ type: 'text', text: text, marks: [{ type: 'link', attrs: linkAttributes }] }])
        .setTextSelection({ from, to: from + text.length })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink(linkAttributes).run();
    }
    setIsLinkModalOpen(false);
  }, [editor]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    // Cloudinary's API doesn't strictly need cloud_name in formData if it's in the URL,
    // but some SDKs or direct API calls might use it. Here, it's part of the URL.

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Image upload failed');
      }

      const data = await response.json();
      editor.chain().focus().setImage({ src: data.secure_url, alt: file.name }).run();
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      setImageUploadError(err.message || 'An unexpected error occurred during upload.');
      // Optionally, display this error to the user in the UI
    } finally {
      setIsUploadingImage(false);
      // Reset file input to allow uploading the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [editor]);

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const buttonClasses = "p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const activeClasses = "bg-primary/10 text-primary hover:bg-primary/20";
  const inactiveClasses = "text-foreground/70 hover:text-foreground hover:bg-muted/60";

  return (
    <>
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleLinkModalSubmit}
        initialUrl={linkModalData.initialUrl}
        initialText={linkModalData.initialText}
        isTextSelected={linkModalData.isTextSelected}
      />
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 mb-2 rounded-t-md">
        {/* Undo/Redo */}
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${buttonClasses} ${inactiveClasses}`}> <Undo className="h-4 w-4" /> </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${buttonClasses} ${inactiveClasses}`}> <Redo className="h-4 w-4" /> </Button>
        <div className="h-6 border-l border-border/60 mx-1"></div>

        {/* Headings */}
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${buttonClasses} ${editor.isActive('heading', { level: 1 }) ? activeClasses : inactiveClasses}`}> <Heading1 className="h-4 w-4" /> </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${buttonClasses} ${editor.isActive('heading', { level: 2 }) ? activeClasses : inactiveClasses}`}> <Heading2 className="h-4 w-4" /> </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${buttonClasses} ${editor.isActive('heading', { level:3 }) ? activeClasses : inactiveClasses}`}> <Heading3 className="h-4 w-4" /> </Button>
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
        <Button variant="ghost" size="icon" onClick={openLinkModal} className={`${buttonClasses} ${editor.isActive('link') ? activeClasses : inactiveClasses}`}> <LinkIcon className="h-4 w-4" /> </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={triggerImageUpload}
          disabled={isUploadingImage}
          className={`${buttonClasses} ${inactiveClasses}`}
        >
          {isUploadingImage ? <UploadCloud className="h-4 w-4 animate-pulse" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
      </div>
      {imageUploadError && (
        <div className="p-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md mb-2 mx-2">
          Image Upload Error: {imageUploadError}
        </div>
      )}
    </>
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
    updateStats(); // Initial call
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
  const { theme } = useTheme(); // Assuming you might use this for styling later

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
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        }
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false, // Important: disable base64 if uploading to Cloudinary
        HTMLAttributes: {
          class: 'uploaded-image', // Add a class for styling if needed
        },
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
    immediatelyRender: false, // Set to false to improve initial load if editor is complex
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/api/auth/signin?callbackUrl=/create-post');
    }
  }, [status, router]);

  // Ensure editor is rendered once status is authenticated
  useEffect(() => {
    if (status === 'authenticated' && editor && !editor.isDestroyed && !editor.isEditable) {
        // This check is a bit tricky; editor might be initialized before session is fully ready.
        // Forcing a re-render or ensuring extensions are loaded.
        // Often, just having the dependency array for useEditor handle this is enough.
        // If `immediatelyRender: false` is used, you might need to manually focus or trigger an update
        // once the editor is ready to be used.
        // editor.commands.focus(); // Example to make it active
    }
  }, [status, editor]);


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
      setTitle(''); // Clear title
      setTags(''); // Clear tags
      editor.commands.clearContent(); // Clear editor content

      setTimeout(() => {
        router.push(`/post/${createdPost.slug}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => () => {
    if (editor && !editor.isDestroyed) { // Check if editor exists and is not already destroyed
        editor.destroy();
    }
  }, [editor]);


  if (status === 'loading' || (status === 'authenticated' && !session?.user && !editor)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse p-4 rounded-md bg-muted/20">
          <p className="text-muted-foreground">Loading Editor & Verifying Authentication...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback or if redirect is slow:
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-4 rounded-md bg-muted/20">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      {/* Ensure your global styles are correctly applied from your layout or _app.tsx */}
      {/* The <style jsx global> block is kept for your specific ProseMirror styles */}
       <style jsx global>{`
        .ProseMirror {
          padding: 1.5rem;
          outline: none !important;
          min-height: 70vh; /* Or a suitable height */
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
        .ProseMirror h1 { font-size: 2.25rem; line-height: 1.2; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; letter-spacing: -0.025em; color: hsl(var(--foreground)); }
        .ProseMirror h2 { font-size: 1.875rem; line-height: 1.25; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.5rem; letter-spacing: -0.025em; color: hsl(var(--foreground)); }
        .ProseMirror h3 { font-size: 1.5rem; line-height: 1.3; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; letter-spacing: -0.025em; color: hsl(var(--foreground)); }
        .ProseMirror p { font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.25rem; color: hsl(var(--foreground)); font-weight: 400; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.75rem; margin-bottom: 1.5rem; font-size: 1.125rem; line-height: 1.8; }
        .ProseMirror ol { list-style-type: decimal; }
        .ProseMirror ul { list-style-type: disc; }
        .ProseMirror li { margin-bottom: 0.5rem; display: list-item; }
        .ProseMirror li > p { margin-bottom: 0.5rem; }

        .ProseMirror blockquote {
          position: relative;
          border-left: 4px solid hsl(var(--primary));
          margin: 1.75rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
          background-color: hsl(var(--muted)/0.3); /* Adjusted opacity */
          padding: 1rem 1rem 1rem 2.5rem;
          border-radius: 0.375rem;
        }
        .ProseMirror blockquote::before {
          content: "“";
          font-family: serif;
          font-size: 3.5em;
          color: hsl(var(--primary)/50);
          position: absolute;
          left: 0.5rem;
          top: -0.2rem;
          line-height: 1;
          opacity: 0.8;
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
          background-color: hsl(var(--card)); /* Use card background, can be themed */
          color: hsl(var(--card-foreground));
          padding: 1.5rem 1.25rem; /* Slightly more padding */
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.75rem 0;
          font-family: var(--font-mono, monospace);
          font-size: 0.95rem;
          border: 1px solid #a0522d; /* Brown border for better UI/UX */
          position: relative;
          border-top: 3px solid hsl(var(--primary)/70);
        }
         .ProseMirror pre::before {
          content: attr(data-language) 'CODE'; /* Display language if available */
          position: absolute;
          top: 5px;
          right: 12px;
          font-size: 0.65rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: hsl(var(--primary));
          background-color: hsl(var(--card));
          padding: 1px 6px;
          border-radius: 3px;
          border: 1px solid hsl(var(--border));
        }
        .ProseMirror pre:not([data-language])::before { /* Fallback if language not detected */
             content: 'CODE';
        }
        .ProseMirror pre code { background-color: transparent; color: inherit; padding: 0; border-radius: 0; font-size: inherit; }
        .ProseMirror img.uploaded-image, .ProseMirror img { /* Target uploaded images and general images */
            max-width: 100%;
            height: auto;
            margin: 2rem auto; /* Center align */
            border-radius: 0.5rem;
            display: block; /* Important for centering with margin auto */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid hsl(var(--border)); /* Optional border */
        }
        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: hsl(var(--primary)/80);
          text-decoration-thickness: 2px;
        }
        .ProseMirror hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 2.5rem 0; }

        .title-input-custom, .tags-input-custom { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .title-input-custom:focus-visible, .tags-input-custom:focus-visible { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 1px hsl(var(--primary)) !important; }

        .preview-mode { padding: 1.5rem; border-radius: 0.5rem; }
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
            disabled={isSubmitting || !editor || !title.trim() || (editor && editor.isEmpty)}
            className="px-4 gap-1.5 ml-2"
            size="sm"
          >
            {isSubmitting ? <Save className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Title and Tags Inputs */}
      <div className="space-y-6 mb-8">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full text-3xl sm:text-4xl font-bold border border-border/60 focus-visible:ring-0 title-input-custom rounded-full px-6 py-4 placeholder:text-muted-foreground/60 h-auto"
          placeholder="Your Story Title"
          disabled={viewMode === 'preview'}
        />
        <div className="relative">
          <Input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-sm border border-border/60 focus-visible:ring-0 tags-input-custom rounded-full px-5 py-3 placeholder:text-muted-foreground/60 text-muted-foreground h-auto"
            placeholder="Add tags separated by commas (e.g., tech, programming, lifestyle)"
            disabled={viewMode === 'preview'}
          />
          {tags && viewMode === 'edit' && (
            <div className="flex flex-wrap gap-1.5 mt-3 px-1">
              {tags.split(',').map((tag) => tag.trim()).filter(tag => tag).map((tag, i) => (
                <div key={i} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
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
            {editor && <TipTapMenuBar editor={editor} />} {/* Ensure editor is passed */}
            <div className="pb-3">
              {editor && <EditorContent editor={editor} />} {/* Ensure editor is passed */}
            </div>
          </>
        ) : (
          <div className="prose dark:prose-invert max-w-none p-4 sm:p-6">
            <h1>{title || 'Untitled Story'}</h1>
            {tags.trim() && (
                 <div className="flex flex-wrap gap-2 my-4">
                    {tags.split(',').map((tag) => tag.trim()).filter(tag => tag).map((tag, i) => (
                        <span key={i} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
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