import express from 'express';
import verifyJWT from '../middlewares/authMiddleware.js';
import {
  getUserProfile,
  getUserPosts,
  updateUserProfile
} from '../controllers/userController.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/:username', getUserProfile); // Public
router.get('/:username/posts', getUserPosts); // Public
router.put('/:id', verifyJWT, updateUserProfile); // Auth required
router.post('/oauth-handler', async (req, res) => {
  const { email, name, avatar, provider, providerAccountId } = req.body;

  // Basic validation: Ensure essential fields from NextAuth are present
  if (!email || !provider || !providerAccountId) {
    return res.status(400).json({
      message: 'Missing required fields: email, provider, or providerAccountId.',
    });
  }

  try {
    // Use the static method on your User model to find or create the user
    const user = await User.findOrCreateFromOAuth({
      email,
      name,
      avatar,
      provider,
      providerAccountId,
    });

    if (!user) {
      // This case should ideally be handled within findOrCreateFromOAuth by throwing an error
      // if user creation fails unexpectedly after multiple attempts or for other reasons.
      console.error('User.findOrCreateFromOAuth returned null or undefined unexpectedly.');
      return res.status(500).json({ message: 'Failed to find or create user due to an unexpected issue.' });
    }

    // Successfully found or created the user.
    // Respond with the user data in the format expected by your NextAuth `signIn` callback.
    // This data will be used to augment the NextAuth user object and populate the JWT.
    res.status(200).json({
      id: user._id.toString(), // CRITICAL: Send MongoDB _id as 'id'
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      username: user.username, // Include username if it's part of your User model and populated
      // You can include other fields here if your NextAuth JWT/session callbacks are set up to use them
    });

  } catch (error) {
    console.error('Error in /api/users/oauth-handler:', error);

    // Handle specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error creating or updating user.', details: error.errors });
    }
    // Handle duplicate key errors (e.g., if a unique field like email or username has a conflict not caught by findOrCreate logic)
    if (error.code === 11000) { // MongoDB duplicate key error code
        return res.status(409).json({ message: 'Conflict: A user with similar unique details already exists.', details: error.keyValue });
    }

    // For other errors, send a generic server error message
    res.status(500).json({ message: 'Server error during OAuth user processing.' });
  }
});

export default router;
