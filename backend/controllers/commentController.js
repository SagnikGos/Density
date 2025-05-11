import Comment from '../models/Comment.js';
import User from '../models/User.js'; // Assuming User model is in this path

// Add a new comment
export const addComment = async (req, res) => {
  try {
    console.log('Backend: Adding comment (manual population logic)');
    const { postId, content } = req.body;
    const userIdFromToken = req.user.userId; // Correct: uses userId from your JWT payload

    console.log('Backend: Value of userIdFromToken for new Comment:', userIdFromToken);

    if (!userIdFromToken) {
      console.error("Backend: User ID from token is undefined. Check JWT payload and req.user.userId access.");
      return res.status(401).json({ message: 'User authentication error: User ID missing from token.' });
    }

    const newCommentDocument = new Comment({
      postId,
      userId: userIdFromToken,
      content
    });
    await newCommentDocument.save();
    console.log('Backend: Comment saved successfully. Comment ID:', newCommentDocument._id);

    const authorDetails = await User.findById(userIdFromToken)
                                  .select('username name avatar _id') // Ensure these fields match your User model and frontend needs
                                  .lean()
                                  .exec();

    console.log('Backend: Fetched author details:', authorDetails);

    if (!authorDetails) {
      console.error('Backend: CRITICAL - Could not find User document for userId:', userIdFromToken, 'although comment was saved. User might have been deleted.');
      const unpopulatedCommentResponse = newCommentDocument.toObject();
      unpopulatedCommentResponse.userId = {
        _id: userIdFromToken,
        username: 'Unknown User',
        name: 'Unknown User',
        avatar: '' 
      };
      console.warn('Backend: Sending comment with placeholder author details as User document was not found.');
      return res.status(201).json(unpopulatedCommentResponse);
    }

    const commentResponseData = newCommentDocument.toObject();
    commentResponseData.userId = authorDetails;

    console.log('Backend: Sending 201 response with manually constructed populated comment.');
    res.status(201).json(commentResponseData);

  } catch (err) {
    console.error('-----------------------------------------');
    console.error('Backend: ERROR in addComment Controller (manual population logic):');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.name === 'ValidationError' && err.errors) {
        console.error('Validation Errors:', err.errors);
    }
    if (!(err.name === 'ValidationError')) {
        console.error('Stack Trace:', err.stack);
    }
    console.error('-----------------------------------------');

    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed to add comment.', errors: err.errors });
    }
    res.status(500).json({ message: 'Failed to add comment due to an internal server error.' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const commentIdToDelete = req.params.id; // ID of the comment to delete
    const authenticatedUserId = req.user.userId; // CORRECTED: Use userId from your JWT payload

    if (!authenticatedUserId) {
        console.error("Backend: User ID from token is undefined in deleteComment.");
        return res.status(401).json({ message: 'User authentication error: User ID missing from token.' });
    }

    const comment = await Comment.findById(commentIdToDelete);

    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' }); // Changed 'error' key to 'message' for consistency
    }
    
    // Authorization check
    if (comment.userId.toString() !== authenticatedUserId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own comments.' }); // Changed 'error' key to 'message'
    }

    await Comment.findByIdAndDelete(commentIdToDelete);
    // Or, if using a Mongoose version that prefers instance methods for hooks:
    // await comment.deleteOne(); 

    res.status(200).json({ message: 'Comment deleted successfully' }); // Standard success response for DELETE

  } catch (err) {
    console.error("Backend: Error in deleteComment Controller:", err);
    res.status(500).json({ message: 'Failed to delete comment due to an internal server error.' }); // Changed 'error' key to 'message'
  }
};

// Get comments for a post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const authenticatedUserId = req.user?.userId; // Correct: uses userId from your JWT payload (optional chaining for guest users)

    const commentsFromDb = await Comment.find({ postId })
                                        .populate('userId', 'username name avatar _id') // Populating user details
                                        .sort({ createdAt: -1 })
                                        .lean();

    // If you've removed the delete feature from the frontend, the 'canDelete' flag might be optional.
    // However, it's good practice for an API to provide such info if it can.
    const commentsWithCanDeleteFlag = commentsFromDb.map(comment => {
      let canCurrentUserDelete = false;
      if (authenticatedUserId && comment.userId && comment.userId._id) { // Ensure comment.userId and its _id exist
        canCurrentUserDelete = comment.userId._id.toString() === authenticatedUserId.toString();
      }
      return {
        ...comment,
        canDelete: canCurrentUserDelete,
      };
    });

    res.status(200).json(commentsWithCanDeleteFlag);
  } catch (err) {
    console.error("Error in getCommentsByPost (backend):", err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};
