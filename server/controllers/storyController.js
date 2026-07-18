const Story = require('../models/Story');
const Follow = require('../models/Follow');

// @desc    Get stories from followed users
// @route   GET /api/stories
const getStories = async (req, res) => {
  try {
    const following = await Follow.find({ followerId: req.user._id }).select('followingId');
    const followingIds = following.map(f => f.followingId);

    const stories = await Story.find({
      userId: { $in: followingIds },
      expiresAt: { $gt: new Date() },
    })
      .populate('userId', 'username fullName profileImage')
      .sort({ createdAt: -1 });

    // Group by user
    const groupedStories = {};
    stories.forEach(story => {
      const userId = story.userId._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.userId,
          stories: [],
        };
      }
      groupedStories[userId].stories.push(story);
    });

    res.json({ stories: Object.values(groupedStories) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's own stories
// @route   GET /api/stories/me
const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({
      userId: req.user._id,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json({ stories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a story
// @route   POST /api/stories
const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const { caption } = req.body;

    const story = await Story.create({
      userId: req.user._id,
      image: `/uploads/${req.file.filename}`,
      caption: caption || '',
    });

    const populated = await Story.findById(story._id)
      .populate('userId', 'username fullName profileImage');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    View a story (add viewer)
// @route   PUT /api/stories/:id/view
const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.json({ message: 'Story viewed', viewerCount: story.viewers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStories, getMyStories, createStory, viewStory, deleteStory };
