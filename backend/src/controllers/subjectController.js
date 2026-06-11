const Subject = require('../models/Subject');
const Resource = require('../models/Resource');

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    
    // Optional: Unlink resources or delete them
    await Resource.updateMany({ subjectId: req.params.id }, { $set: { subjectId: null } });
    
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
