const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const Task = require('../models/Task');

// GET /api/resources — all resources for the authenticated user
exports.getResources = async (req, res) => {
  try {
    const { search, tag, priority, sort, type, subjectId } = req.query;
    const filter = { userId: req.user._id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (tag) filter.tags = tag;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (subjectId) filter.subjectId = subjectId;

    let query = Resource.find(filter);

    // Sort options
    if (sort === 'oldest') query = query.sort({ createdAt: 1 });
    else if (sort === 'mastery') query = query.sort({ masteryLevel: -1 });
    else if (sort === 'priority') query = query.sort({ priority: -1 });
    else query = query.sort({ createdAt: -1 }); // newest first

    const resources = await query;
    res.json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resources/daily-focus — resources not reviewed in 3+ days
exports.getDailyFocus = async (req, res) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const resources = await Resource.find({
      userId: req.user._id,
      lastReviewed: { $lte: threeDaysAgo },
    })
      .sort({ lastReviewed: 1, priority: -1 })
      .limit(10);

    res.json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resources/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [totalResources, totalSubjects, pendingTasks, recentlyReviewed] = await Promise.all([
      Resource.countDocuments({ userId }),
      Subject.countDocuments({ userId }),
      Task.countDocuments({ userId, completed: false }),
      Resource.find({ userId }).sort({ lastReviewed: -1 }).limit(5)
    ]);

    // Calculate total revision count
    const resources = await Resource.find({ userId });
    const totalRevisions = resources.reduce((acc, curr) => acc + (curr.revisionCount || 0), 0);
    const averageMastery = resources.length > 0 
      ? (resources.reduce((acc, curr) => acc + curr.masteryLevel, 0) / resources.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalResources,
        totalSubjects,
        pendingTasks,
        totalRevisions,
        averageMastery,
        recentlyReviewed
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resources/:id
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/resources
exports.createResource = async (req, res) => {
  try {
    req.body.userId = req.user._id;
    
    // Remove subjectId if it's null or empty string to avoid CastError
    if (!req.body.subjectId) {
      delete req.body.subjectId;
    }

    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    console.error('Create Resource Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/resources/:id
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/resources/:id/review — mark a resource as reviewed
exports.markReviewed = async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        $set: { lastReviewed: new Date() },
        $inc: { revisionCount: 1 }
      },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/resources/:id
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/resources — bulk delete
exports.deleteResources = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'IDs array required' });
    }

    await Resource.deleteMany({
      _id: { $in: ids },
      userId: req.user._id,
    });

    res.json({ success: true, message: 'Resources deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/resources/:id/autosave — debounced auto-save endpoint
exports.autoSave = async (req, res) => {
  try {
    const { title, content, tags, subjectId } = req.body;

    const updateOp = {
      $set: { title, content, tags },
    };

    if (subjectId) {
      updateOp.$set.subjectId = subjectId;
    } else {
      // Unset subjectId if empty or null — must be separate operator
      updateOp.$unset = { subjectId: '' };
    }

    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateOp,
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (err) {
    console.error('AutoSave Error:', err);
    res.status(500).json({ message: err.message });
  }
};
