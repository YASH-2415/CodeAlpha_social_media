const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');
const {
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
} = require('../controllers/userController');

// Public routes (with optional auth)
router.get('/', optionalAuth, getUsers);

// Protected routes - must come before /:id to avoid conflicts
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboard);

// User by ID routes
router.get('/:id', optionalAuth, getUserById);
router.put('/:id', protect, uploadProfile, updateUser);
router.delete('/:id', protect, admin, deleteUser);

// Follow/Unfollow
router.post('/:id/follow', protect, followUser);
router.delete('/:id/unfollow', protect, unfollowUser);

// Followers/Following lists
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
