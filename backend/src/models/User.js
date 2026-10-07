const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

// ─────────────────────────────────────────────────────
// USER MODEL
// Custom auth — email + hashed password.
// Role: admin | job_seeker | working | founder
// Status tracks in-game progression: job_seeker | employee | founder
// ─────────────────────────────────────────────────────

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'ai_manager', 'job_seeker', 'working', 'founder'],
        message: '{VALUE} is not a valid role',
      },
      default: 'job_seeker',
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    resumeText: {
      type: String,
      default: null,
    },
    resumeMetadata: {
      filename: { type: String, default: null },
      size: { type: Number, default: null },
      mimetype: { type: String, default: null },
      wordCount: { type: Number, default: 0 },
      pageCount: { type: Number, default: null },
      uploadedAt: { type: Date, default: null },
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot have more than 20 skills',
      },
    },
    domainInterest: {
      type: String,
      trim: true,
      default: null,
    },
    currentStatus: {
      type: String,
      enum: {
        values: ['job_seeker', 'employee', 'founder'],
        message: '{VALUE} is not a valid status',
      },
      default: 'job_seeker',
    },
    expTotal: {
      type: Number,
      default: 0,
      min: [0, 'EXP cannot be negative'],
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastTaskCompletedDate: {
      type: Date,
      default: null,
    },
    corpCoins: {
      type: Number,
      default: 0,
      min: [0, 'CorpCoins cannot be negative'],
    },
    hasReceivedFounderGrant: {
      type: Boolean,
      default: false,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      select: false,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    careerRole: {
      type: String,
      enum: ['job_seeker', 'employee', 'founder'],
      default: 'job_seeker',
    },
    platformRole: {
      type: String,
      enum: ['admin', 'ai_manager', 'none'],
      default: 'none',
    },
    founderStarterCoinGranted: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Sync Career & Platform Roles ─────────────────────
userSchema.pre('save', async function (next) {
  // Keep careerRole and currentStatus in sync
  if (this.currentStatus && !this.careerRole) {
    this.careerRole = this.currentStatus === 'employee' ? 'employee' : this.currentStatus === 'founder' ? 'founder' : 'job_seeker';
  } else if (this.careerRole && !this.currentStatus) {
    this.currentStatus = this.careerRole;
  }

  // Keep platformRole and role in sync
  if (this.role === 'admin') {
    this.platformRole = 'admin';
  } else if (this.role === 'ai_manager') {
    this.platformRole = 'ai_manager';
  } else if (!this.platformRole) {
    this.platformRole = 'none';
  }

  if (this.founderStarterCoinGranted) {
    this.hasReceivedFounderGrant = true;
  } else if (this.hasReceivedFounderGrant) {
    this.founderStarterCoinGranted = true;
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ─── Virtuals ───────────────────────────────────
userSchema.virtual('canBecomeFounder').get(function () {
  return this.expTotal >= 500; // game.founderUnlockExp
});

// ─── Indexes ────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ currentStatus: 1 });
userSchema.index({ expTotal: -1 });

module.exports = mongoose.model('User', userSchema);
