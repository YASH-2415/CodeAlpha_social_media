const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Search users and posts
// @route   GET /api/search?query=
const search = async (req, res) => {
  try {
    const { query, type = 'all', limit = 10 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.json({ users: [], posts: [] });
    }

    const results = {};

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } },
        ],
      })
        .select('username fullName profileImage bio')
        .limit(Number(limit));

      results.users = users;
    }

    // Search posts by caption
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        caption: { $regex: query, $options: 'i' },
      })
        .populate('userId', 'username fullName profileImage')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      results.posts = posts.map(post => ({
        ...post,
        likeCount: post.likes ? post.likes.length : 0,
        commentCount: post.comments ? post.comments.length : 0,
      }));
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Live search suggestions
// @route   GET /api/search/suggestions?query=
const suggestions = async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username fullName profileImage')
      .limit(Number(limit));

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { search, suggestions };
