import Comment from '../models/Comment.js';

// Add a new comment
export const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    const comment = new Comment({ postId, userId, content });
    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized' });

    await Comment.findByIdAndDelete(id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Get comments for a post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).populate('userId', 'username avatar');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
