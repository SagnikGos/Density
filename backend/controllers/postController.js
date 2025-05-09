import Post from '../models/Post.js';
import slugify from 'slugify';

export const createPost = async (req, res) => {
  const { title, content, tags } = req.body;
  const slug = slugify(title, { lower: true });

  try {
    const post = new Post({
      title,
      slug,
      content,
      tags,
      authorId: req.user.id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    post.title = title;
    post.slug = slugify(title, { lower: true });
    post.content = content;
    post.tags = tags;
    post.updatedAt = Date.now();

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error updating post' });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('authorId', 'username avatar').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate('authorId', 'username avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching post' });
  }
};

export const toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const userId = req.user.id;
  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes = post.likes.filter(id => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();
  res.json({ message: alreadyLiked ? 'Unliked' : 'Liked', likesCount: post.likes.length });
};

// Get posts by a specific tag
export const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const posts = await Post.find({ tags: tag }).sort({ createdAt: -1 });
    
    if (!posts.length) {
      return res.status(404).json({ error: 'No posts found for this tag' });
    }

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts by tag' });
  }
};

// Get all unique tags across posts
export const getAllTags = async (req, res) => {
  try {
    const posts = await Post.find({});
    const tags = [...new Set(posts.flatMap(post => post.tags))]; // Get unique tags

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

