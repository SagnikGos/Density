import User from '../models/User.js';
import Post from '../models/Post.js';

// Get user profile by username
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Get all posts by a user
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await Post.find({ authorId: user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Update user profile (bio/avatar)
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { bio, avatar },
      { new: true }
    ).select('-passwordHash');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
