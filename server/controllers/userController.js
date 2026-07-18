const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all users (with optional search)
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    // Exclude current user from results if authenticated
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    const users = await User.find(query)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current authenticated user
// @route   GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username fullName profileImage')
      .populate('following', 'username fullName profileImage');

    const postCount = await Post.countDocuments({ userId: user._id });

    res.json({ ...user.toJSON(), postCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username fullName profileImage')
      .populate('following', 'username fullName profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ userId: user._id });

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({
        followerId: req.user._id,
        followingId: user._id,
      });
      isFollowing = !!follow;
    }

    res.json({ ...user.toJSON(), postCount, isFollowing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const { username, fullName, bio } = req.body;
    const updateData = {};

    if (username) updateData.username = username.toLowerCase();
    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: req.user._id,
      followingId: req.params.id,
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    await Follow.create({
      followerId: req.user._id,
      followingId: req.params.id,
    });

    // Update user arrays
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: req.params.id },
    });

    // Create notification
    await Notification.create({
      userId: req.params.id,
      type: 'follow',
      fromUser: req.user._id,
    });

    res.json({ message: 'Followed successfully', isFollowing: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/unfollow
const unfollowUser = async (req, res) => {
  try {
    await Follow.findOneAndDelete({
      followerId: req.user._id,
      followingId: req.params.id,
    });

    // Update user arrays
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id },
    });

    res.json({ message: 'Unfollowed successfully', isFollowing: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
const getFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const follows = await Follow.find({ followingId: req.params.id })
      .populate('followerId', 'username fullName profileImage bio')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ followingId: req.params.id });

    res.json({
      followers: follows.map(f => f.followerId).filter(Boolean),
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
const getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const follows = await Follow.find({ followerId: req.params.id })
      .populate('followingId', 'username fullName profileImage bio')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ followerId: req.params.id });

    res.json({
      following: follows.map(f => f.followingId).filter(Boolean),
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalPosts, totalLikes, totalFollowers, totalFollowing] = await Promise.all([
      Post.countDocuments({ userId }),
      Post.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
        { $project: { likeCount: { $size: '$likes' } } },
        { $group: { _id: null, total: { $sum: '$likeCount' } } },
      ]),
      Follow.countDocuments({ followingId: userId }),
      Follow.countDocuments({ followerId: userId }),
    ]);

    const likesReceived = totalLikes.length > 0 ? totalLikes[0].total : 0;

    // Get recent posts performance
    const recentPosts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('caption likes comments createdAt');

    res.json({
      totalPosts,
      likesReceived,
      totalFollowers,
      totalFollowing,
      recentPosts: recentPosts.map(p => ({
        ...p.toJSON(),
        likeCount: p.likes.length,
        commentCount: p.comments.length,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user's posts
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

    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getMe,
  getUserById,
  updateUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getDashboard,
  deleteUser,
};
