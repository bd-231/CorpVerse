const mongoose = require('mongoose');
const { Schema } = mongoose;

const corpCoinLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    type: {
      type: String,
      required: true, // e.g. FOUNDER_SEED_GRANT, COMPANY_CREATION, BOT_PURCHASE, SALARY_PAYMENT, TASK_BONUS
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

corpCoinLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CorpCoinLog', corpCoinLogSchema);
