const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// @desc    Get posts feed (from followed users + own posts)
// @route   GET /api/posts
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'all' } = req.query;
    const query = {};

    if (req.user && type === 'feed') {
      // Get posts from followed users + own posts
      const following = await Follow.find({ followerId: req.user._id }).select('followingId');
      const followingIds = following.map(f => f.followingId);
      followingIds.push(req.user._id);
      query.userId = { $in: followingIds };
    } else if (req.user && type === 'user') {
      // Get only current user's posts
      query.userId = req.user._id;
    }

    const posts = await Post.find(query)
      .populate('userId', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add like/comment counts and isLiked status
    const enrichedPosts = posts.map(post => ({
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      commentCount: post.comments ? post.comments.length : 0,
      isLiked: req.user ? (post.likes || []).some(
        id => id.toString() === req.user._id.toString()
      ) : false,
    }));

    const total = await Post.countDocuments(query);

    res.json({
      posts: enrichedPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending posts (most liked)
// @route   GET /api/posts/trending
const getTrending = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const posts = await Post.aggregate([
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' },
        },
      },
      { $sort: { likeCount: -1, createdAt: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          'userId.__v': 0,
        },
      },
    ]);

    const enrichedPosts = posts.map(post => ({
      ...post,
      isLiked: req.user ? (post.likes || []).some(
        id => id.toString() === req.user._id.toString()
      ) : false,
    }));

    res.json({ posts: enrichedPosts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const { caption } = req.body;

    const post = await Post.create({
      userId: req.user._id,
      image: `/uploads/${req.file.filename}`,
      caption: caption || '',
    });

    const populated = await Post.findById(post._id)
      .populate('userId', 'username fullName profileImage');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username fullName profileImage')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username fullName profileImage' },
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const enrichedPost = {
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      commentCount: post.comments ? post.comments.length : 0,
      isLiked: req.user ? (post.likes || []).some(
        id => id.toString() === req.user._id.toString()
      ) : false,
    };

    res.json(enrichedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update post (caption only)
// @route   PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const { caption } = req.body;
    if (caption !== undefined) post.caption = caption;

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('userId', 'username fullName profileImage');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Allow post owner or admin to delete
    if (post.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated comments
    await Comment.deleteMany({ postId: post._id });
    // Delete associated likes
    await Like.deleteMany({ postId: post._id });
    // Delete the post
    await Post.findByIdAndDelete(post._id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      userId: req.user._id,
      postId: req.params.id,
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Already liked this post' });
    }

    // Create like record
    await Like.create({ userId: req.user._id, postId: req.params.id });

    // Add to post's likes array
    post.likes.push(req.user._id);
    await post.save();

    // Create notification (don't notify yourself)
    if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: post.userId,
        type: 'like',
        fromUser: req.user._id,
        postId: post._id,
      });
    }

    res.json({
      message: 'Post liked',
      likeCount: post.likes.length,
      isLiked: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/unlike
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove like record
    await Like.findOneAndDelete({ userId: req.user._id, postId: req.params.id });

    // Remove from post's likes array
    post.likes = post.likes.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await post.save();

    res.json({
      message: 'Post unliked',
      likeCount: post.likes.length,
      isLiked: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get posts by user ID
// @route   GET /api/posts/user/:userId
const getPostsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const enrichedPosts = posts.map(post => ({
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      commentCount: post.comments ? post.comments.length : 0,
      isLiked: req.user ? (post.likes || []).some(
        id => id.toString() === req.user._id.toString()
      ) : false,
    }));

    const total = await Post.countDocuments({ userId: req.params.userId });

    res.json({
      posts: enrichedPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  getTrending,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostsByUser,
};
