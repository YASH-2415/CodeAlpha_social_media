const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  getStats,
  getAllUsers,
  deleteUser,
  deletePost,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.delete('/posts/:id', deletePost);

module.exports = router;
