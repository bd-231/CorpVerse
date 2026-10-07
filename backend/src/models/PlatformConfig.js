const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * PlatformConfig Schema
 * Centralized, authoritative configuration for CorpVerse v1.0.
 */
const platformConfigSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    founder: {
      unlockExp: { type: Number, default: 12000 },
      starterCorpCoin: { type: Number, default: 1000 },
    },
    employee: {
      dailyTaskLimit: { type: Number, default: 1 },
      dailyBonusTaskLimit: { type: Number, default: 1 },
      warningThreshold: { type: Number, default: 4 },
      warningExpirationDays: { type: Number, default: 30 },
    },
    company: {
      creationCost: { type: Number, default: 100 },
      maxEmployees: { type: Number, default: 20 },
      bankruptcyThreshold: { type: Number, default: -1000 },
      maxActivePerFounder: { type: Number, default: 1 },
    },
    botPrices: {
      hiringBot: { type: Number, default: 250 },
      taskBot: { type: Number, default: 250 },
      evaluationBot: { type: Number, default: 250 },
      advancedHiringBot: { type: Number, default: 400 },
      advancedTaskBot: { type: Number, default: 400 },
      advancedEvaluationBot: { type: Number, default: 400 },
    },
    tasks: {
      expMinimum: { type: Number, default: 10 },
      expMaximum: { type: Number, default: 100 },
      easyMaxExp: { type: Number, default: 30 },
      mediumMaxExp: { type: Number, default: 60 },
      hardMaxExp: { type: Number, default: 100 },
    },
    applications: {
      maxActive: { type: Number, default: 5 },
    },
    ai: {
      retryPerProvider: { type: Number, default: 3 },
      timeoutMs: { type: Number, default: 30000 },
      providersPriority: {
        type: [String],
        default: ['gemini', 'openai', 'grok'],
      },
    },
    resume: {
      maxSizeMb: { type: Number, default: 10 },
      allowedFormats: { type: [String], default: ['pdf', 'docx'] },
    },
    levels: [
      {
        level: { type: Number, required: true },
        name: { type: String, required: true },
        totalExpRequired: { type: Number, required: true },
      },
    ],
    supportedDomains: {
      type: [String],
      default: ['SOFTWARE_ENGINEERING', 'CLOUD_ENGINEERING', 'AI_ENGINEERING'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
