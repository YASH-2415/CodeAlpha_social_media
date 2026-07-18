const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Create a comment
// @route   POST /api/comments
const createComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ message: 'Post ID and text are required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      userId: req.user._id,
      postId,
      text: text.trim(),
    });

    // Add comment reference to post
    post.comments.push(comment._id);
    await post.save();

    // Populate user info
    const populated = await Comment.findById(comment._id)
      .populate('userId', 'username fullName profileImage');

    // Create notification (don't notify yourself)
    if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: post.userId,
        type: 'comment',
        fromUser: req.user._id,
        postId: post._id,
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    const { text } = req.body;
    if (text) comment.text = text.trim();
    await comment.save();

    const populated = await Comment.findById(comment._id)
      .populate('userId', 'username fullName profileImage');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Allow comment owner or post owner to delete
    const post = await Post.findById(comment.postId);
    const isPostOwner = post && post.userId.toString() === req.user._id.toString();
    const isCommentOwner = comment.userId.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment reference from post
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: comment._id },
    });

    // Delete comment
    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
const getCommentsByPost = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ postId: req.params.postId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByPost,
};
