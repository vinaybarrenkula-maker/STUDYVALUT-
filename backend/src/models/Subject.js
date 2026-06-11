const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Book',
    },
    color: {
      type: String,
      default: '#2563eb',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
