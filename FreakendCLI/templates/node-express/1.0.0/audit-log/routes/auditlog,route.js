const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditlog.controller');
const { 
  authenticate, 
  authorize,
  auditLogger,
  manualAuditLog,
  validateRequest,
  rateLimit
} = require('../middlewares');
const { 
  auditLogQuerySchema,
  exportAuditLogSchema 
} = require('../validations');

// Apply audit logging to all routes except audit logs themselves
router.use(auditLogger({ 
  skipRoutes: [
    '/audit-logs', 
    '/audit-logs/export',
    '/audit-logs/security-events'
  ]
}));
router.use(manualAuditLog);

// Global rate limiting (different tiers for different routes)
router.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

// --- Core Audit Log Routes ---
router.get(
  '/',
  authenticate,
  authorize('audit_logs:read'),
  validateRequest(auditLogQuerySchema),
  auditLogController.getAuditLogs
);

router.get(
  '/:id',
  authenticate,
  authorize('audit_logs:read'),
  auditLogController.getAuditLogById
);

// --- Security Monitoring Routes ---
router.get(
  '/security-events',
  authenticate,
  authorize('security_events:read'),
  validateRequest(auditLogQuerySchema),
  rateLimit({ windowMs: 60 * 1000, max: 30 }), // Stricter limits
  auditLogController.getSecurityEvents
);

router.get(
  '/ip/:ip/activity',
  authenticate,
  authorize('ip_activity:investigate'),
  validateRequest(auditLogQuerySchema),
  auditLogController.getIpActivity
);

// --- Data Export Routes ---
router.get(
  '/export',
  authenticate,
  authorize('audit_logs:export'),
  validateRequest(exportAuditLogSchema),
  rateLimit({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 exports/hour
  auditLogController.exportAuditLogs
);

// --- Analytics Routes ---
router.get(
  '/stats/overview',
  authenticate,
  authorize('audit_logs:analyze'),
  auditLogController.getAuditLogStats
);

router.get(
  '/heatmap/activity',
  authenticate,
  authorize('audit_logs:analyze'),
  auditLogController.getActivityHeatmap
);

// --- User Activity Routes ---
router.get(
  '/user/:userId/activity',
  authenticate,
  authorize('user_activity:view'),
  validateRequest(auditLogQuerySchema),
  auditLogController.getUserActivity
);

module.exports = router;