import React, { useState } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CommentSection = ({ ticketId, comments = [], onCommentAdded }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onCommentAdded(text.trim());
      setText('');
      addToast('Comment posted successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            No comments yet. Start the conversation below.
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = comment.userId?._id === user?._id;
            return (
              <div
                key={comment._id}
                style={{
                  padding: '16px',
                  backgroundColor: isMe ? '#f8fafc' : '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      {comment.userId?.name ? comment.userId.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                        {comment.userId?.name || 'User'}
                      </span>
                      <span className="badge badge-role" style={{ marginLeft: '8px' }}>
                        {comment.userId?.role?.replace('_', ' ') || 'EMPLOYEE'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#334155',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    paddingLeft: '36px'
                  }}
                >
                  {comment.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Box */}
      <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label">Add a Note or Response</label>
          <textarea
            rows={3}
            placeholder="Type your comment or update here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea"
            disabled={isSubmitting}
            required
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={isSubmitting || !text.trim()} className="btn btn-primary">
            <Send size={15} /> {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
