const express = require('express');
const router = express.Router();
const { getStories, getMyStories, createStory, viewStory, deleteStory } = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPost } = require('../middleware/uploadMiddleware');

router.get('/', protect, getStories);
router.get('/me', protect, getMyStories);
router.post('/', protect, uploadPost, createStory);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
