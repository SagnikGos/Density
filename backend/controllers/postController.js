import Post from '../models/Post.js'; // Your Post model
import User from '../models/User.js'; // Your User model
import Comment from '../models/Comment.js'; // Your Comment model
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation if needed

// Helper function to create a slug (you might have this elsewhere)
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-');        // Replace multiple hyphens with single
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const authorId = req.user.userId; // Assuming userId is on req.user from verifyJWT

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const slug = generateSlug(title);
    // Optionally, check if slug is unique and append a suffix if not

    const newPost = new Post({
      title,
      slug,
      content,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      authorId,
      likes: [],
    });

    await newPost.save();
    // Populate author details for the response
    const populatedPost = await Post.findById(newPost._id).populate('authorId', 'username name avatar _id').lean();
    
    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("Error in createPost (backend):", err);
    if (err.code === 11000) { // Duplicate key error (e.g. for unique slug if you add index)
        return res.status(409).json({ message: 'A post with this title or slug already exists.' });
    }
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// Get all posts with author details and comments count
export const getAllPosts = async (req, res) => {
  try {
    const postsWithDetails = await Post.aggregate([
      {
        $sort: { createdAt: -1 } // Sort by newest first
      },
      {
        $lookup: { // Join with users collection to get author details
          from: User.collection.name,
          localField: 'authorId',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      {
        $unwind: { // Deconstruct the authorInfo array
          path: '$authorInfo',
          preserveNullAndEmptyArrays: true // Keep posts even if author is somehow missing
        }
      },
      {
        $lookup: { // Join with comments collection to count comments
          from: Comment.collection.name,
          localField: '_id',
          foreignField: 'postId',
          as: 'postComments'
        }
      },
      {
        $addFields: { // Add the commentsCount and structure authorId correctly
          commentsCount: { $size: '$postComments' },
          authorId: { // Reconstruct authorId to match frontend expectations
            _id: '$authorInfo._id',
            username: '$authorInfo.username',
            name: '$authorInfo.name',
            avatar: '$authorInfo.avatar'
          }
        }
      },
      {
        $project: { // Select fields to return
          title: 1,
          slug: 1,
          content: 1, // For list view, consider sending a snippet instead of full content
          tags: 1,
          authorId: 1, // This is the reconstructed author object
          likes: 1,
          commentsCount: 1,
          createdAt: 1,
          updatedAt: 1,
          // postComments: 0, // Optionally remove the full comments array from the response
        }
      }
    ]);

    res.status(200).json(postsWithDetails);
  } catch (err) {
    console.error("Error in getAllPosts (backend):", err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};


// Get a single post by slug with author details
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug })
                           .populate('authorId', 'username name avatar _id') // Populate author details
                           .lean(); // Use lean for plain JS object

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Note: commentsCount is not added here by default.
    // If needed on single post page initially, you'd count comments separately
    // or adjust the query. The single post page fetches comments separately anyway.
    res.status(200).json(post);
  } catch (err) {
    console.error("Error in getPostBySlug (backend):", err);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

// Update a post by ID
export const updatePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.userId; // From verifyJWT

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid post ID format.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to update this post' });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (title) post.slug = generateSlug(title); // Regenerate slug if title changes
    if (tags !== undefined) {
        post.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []);
    }
    post.updatedAt = Date.now();

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate('authorId', 'username name avatar _id').lean();

    res.status(200).json(populatedPost);
  } catch (err) {
    console.error("Error in updatePost (backend):", err);
    if (err.code === 11000) {
        return res.status(409).json({ message: 'A post with this title or slug already exists.' });
    }
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// Delete a post by ID
export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.userId; // From verifyJWT

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid post ID format.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    // Also delete associated comments
    await Comment.deleteMany({ postId: postId });
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post and associated comments deleted successfully' });
  } catch (err) {
    console.error("Error in deletePost (backend):", err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// Toggle like on a post
export const toggleLike = async (req, res) => {
  try {
    const { id: postId } = req.params; // This 'id' comes from the route /api/posts/like/:id
    const userId = req.user.userId; // From verifyJWT, using 'userId' as per your JWT payload

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid post ID format.' });
    }
    if (!userId) { // Should be caught by verifyJWT, but as a safeguard
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // User hasn't liked it yet, so add like
      post.likes.push(userId);
    } else {
      // User has liked it, so remove like (unlike)
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ likes: post.likes }); // Send back the updated likes array
  } catch (err) {
    console.error("Error in toggleLike (backend):", err);
    res.status(500).json({ message: 'Failed to toggle like on post' });
  }
};

// Get posts by tag
export const getPostsByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        // Similar to getAllPosts, but with an initial $match stage for the tag
        const postsWithDetailsByTag = await Post.aggregate([
            {
                $match: { tags: tag } // Filter by tag
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: User.collection.name,
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            {
                $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: Comment.collection.name,
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'postComments'
                }
            },
            {
                $addFields: {
                    commentsCount: { $size: '$postComments' },
                    authorId: {
                        _id: '$authorInfo._id',
                        username: '$authorInfo.username',
                        name: '$authorInfo.name',
                        avatar: '$authorInfo.avatar'
                    }
                }
            },
            {
                $project: {
                    title: 1, slug: 1, content: 1, tags: 1, authorId: 1,
                    likes: 1, commentsCount: 1, createdAt: 1, updatedAt: 1,
                }
            }
        ]);

        if (!postsWithDetailsByTag || postsWithDetailsByTag.length === 0) {
            return res.status(200).json([]); // Return empty array if no posts found for the tag
        }
        res.status(200).json(postsWithDetailsByTag);
    } catch (err) {
        console.error(`Error in getPostsByTag (backend) for tag "${req.params.tag}":`, err);
        res.status(500).json({ message: 'Failed to fetch posts by tag' });
    }
};

// Get all unique tags with their counts
export const getAllTags = async (req, res) => {
    try {
        const tags = await Post.aggregate([
            { $unwind: '$tags' }, // Deconstruct the tags array
            { $group: { _id: '$tags', count: { $sum: 1 } } }, // Group by tag and count occurrences
            { $sort: { count: -1 } }, // Sort by most frequent
            { $project: { _id: 0, name: '$_id', count: 1 } } // Rename _id to name for clarity
        ]);
        res.status(200).json(tags);
    } catch (err) {
        console.error("Error in getAllTags (backend):", err);
        res.status(500).json({ message: 'Failed to fetch tags' });
    }
};
