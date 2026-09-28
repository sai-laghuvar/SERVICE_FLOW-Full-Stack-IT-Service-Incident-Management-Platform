const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ ticketId: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
