const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByPost,
} = require('../controllers/commentController');

router.post('/', protect, createComment);
router.get('/post/:postId', getCommentsByPost);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
