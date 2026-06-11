const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getResources,
  getDailyFocus,
  getDashboardStats,
  getResource,
  createResource,
  updateResource,
  markReviewed,
  deleteResource,
  deleteResources,
  autoSave,
} = require('../controllers/resourceController');

const upload = require('../config/uploadConfig');

// All resource routes are protected
router.use(verifyToken);

// ⚠️ IMPORTANT: Static routes MUST come before dynamic /:id routes
// otherwise Express treats 'stats', 'daily-focus', 'upload' as :id values

router.get('/stats', getDashboardStats);
router.get('/daily-focus', getDailyFocus);

router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const resources = await Promise.all(
      files.map(async (file) => {
        return require('../models/Resource').create({
          userId: req.user._id,
          title: file.originalname,
          url: `/uploads/${file.filename}`,
          type: 'file',
          tags: ['imported'],
        });
      })
    );

    res.status(201).json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.route('/').get(getResources).post(createResource).delete(deleteResources);

// Dynamic /:id routes come last
router.route('/:id').get(getResource).put(updateResource).delete(deleteResource);
router.patch('/:id/review', markReviewed);
router.put('/:id/autosave', autoSave);

module.exports = router;
