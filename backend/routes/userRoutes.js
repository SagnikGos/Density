import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import {
  getUserProfile,
  getUserPosts,
  updateUserProfile
} from '../controllers/userController.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/:username', getUserProfile); // Public
router.get('/:username/posts', getUserPosts); // Public
router.put('/:id', verifyJWT, updateUserProfile); // Auth required
/**
 * @route   POST /api/users/oauth-handler
 * @desc    Handles user sign-in/sign-up via OAuth providers.
 * Generates a JWT for the authenticated user.
 * @access  Public (called by NextAuth backend)
 */
router.post('/oauth-handler', async (req, res) => {
  const { email, name, avatar, provider, providerAccountId } = req.body;

  if (!email || !provider || !providerAccountId) {
    return res.status(400).json({
      message: 'Missing required fields: email, provider, or providerAccountId.',
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the backend environment.');
    return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
  }

  try {
    const user = await User.findOrCreateFromOAuth({
      email,
      name,
      avatar,
      provider,
      providerAccountId,
    });

    if (!user) {
      console.error('[OAuth Handler] User.findOrCreateFromOAuth returned null or undefined.');
      return res.status(500).json({ message: 'Failed to find or create user due to an unexpected issue.' });
    }

    // Successfully found or created the user. Now, generate a JWT.
    const payload = {
      userId: user._id, // Use the MongoDB user ID in the JWT payload
      email: user.email,
      // You can add other relevant, non-sensitive info to the payload if needed
      // For example: username: user.username
    };

    // Sign the token. Use the same JWT_SECRET that your verifyJWT middleware uses.
    // Set an expiration time for the token (e.g., '1d', '7d', '1h')
    const backendJwtToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } // Default to 1 day if not set in .env
    );

    console.log(`[OAuth Handler] JWT generated for user: ${user.email}`);

    // Respond with user data AND the generated JWT.
    res.status(200).json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      username: user.username,
      token: backendJwtToken, // <<<< THIS IS THE NEWLY ADDED JWT
    });

  } catch (error) {
    console.error('[OAuth Handler] Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', details: error.errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Conflict: User details conflict.', details: error.keyValue });
    }
    res.status(500).json({ message: 'Server error during OAuth user processing.' });
  }
});

export default router;
