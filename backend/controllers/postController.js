// controllers/postController.js
import Post from '../models/Post.js'; // Ensure this path is correct
import slugify from 'slugify'; // Make sure you have 'slugify' installed (npm install slugify)

/**
 * @desc    Create a new blog post
 * @route   POST /api/posts
 * @access  Protected (requires JWT authentication)
 */
export const createPost = async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  // Generate slug from title
  const slug = slugify(title, { lower: true, strict: true });

  try {
    // req.user should be populated by your verifyJWT middleware
    // It's expected to have a 'userId' property from the JWT payload
    if (!req.user || !req.user.userId) {
      console.error('[Create Post] Error: User ID not found in req.user. JWT might be missing userId or middleware issue.');
      return res.status(401).json({ message: 'User authentication error, user ID not found.' });
    }

    const newPost = new Post({
      title,
      slug,
      content,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []), // Handle tags flexibly
      authorId: req.user.userId, // Correctly use userId from JWT payload
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Error in createPost controller:', err);
    // Check for Mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error creating post', error: err.message, details: err.errors });
    }
    // Check for duplicate key error (e.g., if slug needs to be unique and isn't)
    if (err.code === 11000) {
        return res.status(409).json({ message: 'Conflict: A post with similar unique details (e.g., slug) might already exist.', error: err.message });
    }
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
};

/**
 * @desc    Update an existing blog post
 * @route   PUT /api/posts/:id
 * @access  Protected
 */
export const updatePost = async (req, res) => {
  const { id: postId } = req.params; // Renaming for clarity
  const { title, content, tags } = req.body;

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'User authentication error, user ID not found.' });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the logged-in user is the author of the post
    if (post.authorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'User not authorized to update this post' });
    }

    // Update fields if they are provided
    if (title) {
      post.title = title;
      post.slug = slugify(title, { lower: true, strict: true });
    }
    if (content) {
      post.content = content;
    }
    if (tags !== undefined) { // Allow clearing tags with an empty array or string
        post.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []);
    }
    // Mongoose `timestamps: true` in schema will automatically update `updatedAt`

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error('Error in updatePost controller:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error updating post', error: err.message, details: err.errors });
    }
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid post ID format.' });
    }
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/posts/:id
 * @access  Protected
 */
export const deletePost = async (req, res) => {
  const { id: postId } = req.params;

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'User authentication error, user ID not found.' });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne(); // Mongoose v6+ uses deleteOne() on the document
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error in deletePost controller:', err);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid post ID format.' });
    }
    res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
};

/**
 * @desc    Get all blog posts
 * @route   GET /api/posts
 * @access  Public
 */
export const getAllPosts = async (req, res) => {
  try {
    // Consider adding pagination here for production: e.g., req.query.page, req.query.limit
    const posts = await Post.find()
      .populate('authorId', 'username avatar name') // Populate author details
      .sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error in getAllPosts controller:', err);
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};

/**
 * @desc    Get a single blog post by its slug
 * @route   GET /api/posts/:slug
 * @access  Public
 */
export const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('authorId', 'username avatar name'); // Populate author details

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error('Error in getPostBySlug controller:', err);
    res.status(500).json({ message: 'Error fetching post', error: err.message });
  }
};

/**
 * @desc    Toggle like/unlike on a post
 * @route   POST /api/posts/like/:id
 * @access  Protected
 */
export const toggleLike = async (req, res) => {
  const { id: postId } = req.params;

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'User authentication error, user ID not found.' });
  }
  const currentUserId = req.user.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    const likeIndex = post.likes.findIndex(id => id.toString() === currentUserId);

    if (likeIndex > -1) {
      // User has liked, so unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // User has not liked, so like
      post.likes.push(currentUserId);
    }

    const updatedPost = await post.save();
    res.status(200).json({
      message: likeIndex > -1 ? 'Post unliked successfully' : 'Post liked successfully',
      likesCount: updatedPost.likes.length,
      likes: updatedPost.likes // Optionally return the array of likes
    });
  } catch (err) {
    console.error('Error in toggleLike controller:', err);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid post ID format.' });
    }
    res.status(500).json({ message: 'Error toggling like on post', error: err.message });
  }
};

/**
 * @desc    Get posts by a specific tag
 * @route   GET /api/posts/tag/:tag
 * @access  Public
 */
export const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    // Consider case-insensitive tag search if desired: new RegExp(`^${tag}$`, 'i')
    const posts = await Post.find({ tags: tag })
      .populate('authorId', 'username avatar name')
      .sort({ createdAt: -1 });

    // It's okay to return an empty array if no posts are found for a tag,
    // rather than a 404, as it's a valid query with no results.
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error in getPostsByTag controller:', err);
    res.status(500).json({ message: 'Error fetching posts by tag', error: err.message });
  }
};

/**
 * @desc    Get all unique tags across all posts
 * @route   GET /api/posts/tags
 * @access  Public
 */
export const getAllTags = async (req, res) => {
  try {
    // More efficient way to get distinct tags directly from MongoDB
    const tags = await Post.distinct('tags');
    res.status(200).json(tags.sort()); // Sort tags alphabetically
  } catch (err) {
    console.error('Error in getAllTags controller:', err);
    res.status(500).json({ message: 'Error fetching tags', error: err.message });
  }
};
