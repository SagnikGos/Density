import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import {
  addComment,
  deleteComment,
  getCommentsByPost
} from '../controllers/commentController.js';

const router = express.Router();

// Add a comment (auth required)
router.post('/', verifyJWT, addComment);

// Delete a comment (auth required)
router.delete('/:id', verifyJWT, deleteComment);

// Get all comments for a post (public)
router.get('/:postId', getCommentsByPost);

export default router;
