const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../config/constants');

const auditLogSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: Object.values(AUDIT_ACTIONS)
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ ticketId: 1, createdAt: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
