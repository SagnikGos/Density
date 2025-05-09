import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import {
  getUserProfile,
  getUserPosts,
  updateUserProfile
} from '../controllers/userController.js';

const router = express.Router();

router.get('/:username', getUserProfile); // Public
router.get('/:username/posts', getUserPosts); // Public
router.put('/:id', verifyJWT, updateUserProfile); // Auth required

export default router;
