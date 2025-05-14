import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${params.slug}`);
    if (!response.ok) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }
    
    const post = await response.json();
    
    // Extract the first image from the content if it exists
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    const firstImage = imgMatch ? imgMatch[1] : null;
    
    return {
      title: post.title,
      description: post.content.replace(/<[^>]*>/g, '').slice(0, 160), // Strip HTML tags and limit to 160 chars
      openGraph: {
        title: post.title,
        description: post.content.replace(/<[^>]*>/g, '').slice(0, 160),
        type: 'article',
        images: firstImage ? [{ url: firstImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.content.replace(/<[^>]*>/g, '').slice(0, 160),
        images: firstImage ? [firstImage] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'Error Loading Post',
      description: 'There was an error loading the post.',
    };
  }
} 