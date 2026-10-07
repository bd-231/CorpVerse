const mongoose = require('mongoose');
const { Schema } = mongoose;

const resumeAnalysisSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeFile: {
      type: Schema.Types.ObjectId,
      ref: 'ResumeFile',
    },
    extractedText: {
      type: String,
      default: '',
    },
    skillsDetected: {
      type: [String],
      default: [],
    },
    domainRecommended: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    analysisSummary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
