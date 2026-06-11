const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      index: true,
    },
    type: {
      type: String,
      enum: ['note', 'snippet', 'link', 'file'],
      default: 'note',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    language: {
      type: String, // For code snippets
      default: 'javascript',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    masteryLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    revisionCount: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    lastReviewed: {
      type: Date,
      default: Date.now,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for fast user-specific retrieval
ResourceSchema.index({ userId: 1, lastReviewed: 1 });
ResourceSchema.index({ userId: 1, tags: 1 });
ResourceSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);
