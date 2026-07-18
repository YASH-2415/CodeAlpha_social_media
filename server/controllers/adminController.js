const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const Notification = require('../models/Notification');

// @desc    Get platform stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalComments, totalFollows, totalLikes] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Follow.countDocuments(),
      Like.countDocuments(),
    ]);

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username fullName email profileImage createdAt');

    // Most active users (by post count)
    const topPosters = await Post.aggregate([
      { $group: { _id: '$userId', postCount: { $sum: 1 } } },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          fullName: '$user.fullName',
          profileImage: '$user.profileImage',
          postCount: 1,
        },
      },
    ]);

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalFollows,
      totalLikes,
      recentUsers,
      topPosters,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Enrich with post counts
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const postCount = await Post.countDocuments({ userId: user._id });
        return { ...user.toJSON(), postCount };
      })
    );

    res.json({
      users: enrichedUsers,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user's posts
    const posts = await Post.find({ userId: req.params.id });
    for (const post of posts) {
      await Comment.deleteMany({ postId: post._id });
      await Like.deleteMany({ postId: post._id });
    }
    await Post.deleteMany({ userId: req.params.id });

    // Delete all follows
    await Follow.deleteMany({
      $or: [{ followerId: req.params.id }, { followingId: req.params.id }],
    });

    // Delete notifications
    await Notification.deleteMany({
      $or: [{ userId: req.params.id }, { fromUser: req.params.id }],
    });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: `User ${user.username} and all associated data deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post (admin)
// @route   DELETE /api/admin/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Comment.deleteMany({ postId: post._id });
    await Like.deleteMany({ postId: post._id });
    await Post.findByIdAndDelete(post._id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getAllUsers, deleteUser, deletePost };
