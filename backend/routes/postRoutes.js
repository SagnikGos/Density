import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostBySlug,
  toggleLike,
  getPostsByTag,
  getAllTags
} from '../controllers/postController.js';

const router = express.Router();

// Create a new post (protected)
router.post('/', verifyJWT, createPost);

// Update a post by ID (protected)
router.put('/:id', verifyJWT, updatePost);

// Delete a post by ID (protected)
router.delete('/:id', verifyJWT, deletePost);

// Get all posts (public)
router.get('/', getAllPosts);

// Get a single post by slug (public)
router.get('/:slug', getPostBySlug);

// Like/Unlike a post (protected)
router.post('/like/:id', verifyJWT, toggleLike);

// Get posts by tag (public)
router.get('/tag/:tag', getPostsByTag);

// Get all unique tags (public)
router.get('/tags', getAllTags);

export default router;
