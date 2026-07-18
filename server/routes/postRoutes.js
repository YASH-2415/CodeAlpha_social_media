const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadPost } = require('../middleware/uploadMiddleware');
const {
  getPosts,
  getTrending,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostsByUser,
} = require('../controllers/postController');

// Public / optionally authenticated
router.get('/', optionalAuth, getPosts);
router.get('/trending', optionalAuth, getTrending);
router.get('/user/:userId', optionalAuth, getPostsByUser);

// Protected
router.post('/', protect, uploadPost, createPost);
router.get('/:id', optionalAuth, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Like / Unlike
router.post('/:id/like', protect, likePost);
router.delete('/:id/unlike', protect, unlikePost);

module.exports = router;
