const mongoose = require('mongoose');
const {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES
} = require('../config/constants');

const resolutionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a ticket description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: Object.values(TICKET_CATEGORIES),
        message: '{VALUE} is not a valid category'
      },
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TICKET_PRIORITIES),
        message: '{VALUE} is not a valid priority'
      },
      default: TICKET_PRIORITIES.MEDIUM,
      index: true
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TICKET_STATUSES),
        message: '{VALUE} is not a valid status'
      },
      default: TICKET_STATUSES.OPEN,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    resolution: {
      type: resolutionSchema,
      default: null
    },
    slaDeadline: {
      type: Date,
      index: true
    },
    isBreached: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for performant querying and filtering
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdBy: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

// Helper to check if ticket breached SLA
ticketSchema.methods.checkSLABreach = function () {
  if (
    this.slaDeadline &&
    this.status !== TICKET_STATUSES.RESOLVED &&
    this.status !== TICKET_STATUSES.CLOSED
  ) {
    return new Date() > this.slaDeadline;
  }
  return false;
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
