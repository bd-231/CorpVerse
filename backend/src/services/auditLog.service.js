const AuditLog = require('../models/AuditLog');

class AuditLogService {
  async logAction({ who, what, target = null, oldValue = null, newValue = null, reason = null, metadata = {} }) {
    try {
      const log = await AuditLog.create({
        who,
        what,
        target,
        oldValue,
        newValue,
        reason,
        metadata,
      });
      return log;
    } catch (err) {
      console.warn('AuditLog logging failed:', err.message);
      return null;
    }
  }

  async getLogs({ page = 1, limit = 50, what = null }) {
    const filter = {};
    if (what) filter.what = what;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('who', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new AuditLogService();
