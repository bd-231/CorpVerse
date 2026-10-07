const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getDomains,
  createDomain,
  deleteDomain,
  getRedeemCodes,
  createRedeemCode,
  deleteRedeemCode,
  getPlatformConfig,
  updatePlatformConfig,
  getAuditLogs,
} = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(requireAuth, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// PlatformConfig management
router.get('/config', getPlatformConfig);
router.patch('/config', updatePlatformConfig);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Domain management
router.get('/domains', getDomains);
router.post('/domains', createDomain);
router.delete('/domains/:id', deleteDomain);

// EXP Redeem Code management
router.get('/redeem-codes', getRedeemCodes);
router.post('/redeem-codes', createRedeemCode);
router.delete('/redeem-codes/:id', deleteRedeemCode);

module.exports = router;
