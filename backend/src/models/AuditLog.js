const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    who: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    what: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      default: null,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ who: 1, createdAt: -1 });
auditLogSchema.index({ what: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
