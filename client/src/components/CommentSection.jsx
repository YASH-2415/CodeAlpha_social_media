import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import commentService from '../services/commentService';
import { useAuth } from '../hooks/useAuth';
import './CommentSection.css';

export default function CommentSection({ postId, commentCount }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentService.getCommentsByPost(postId);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await commentService.createComment(postId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Could not add comment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentService.deleteComment(id);
      setComments(prev => prev.filter(c => c._id !== id));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Could not delete comment');
    }
  };

  const handleEdit = async (id) => {
    try {
      const updated = await commentService.updateComment(id, editText);
      setComments(prev => prev.map(c => c._id === id ? updated : c));
      setEditingId(null);
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Could not update comment');
    }
  };

  return (
    <div className="comment-section">
      {/* Comment input */}
      {user && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={300}
          />
          <button type="submit" disabled={!newComment.trim()}>Post</button>
        </form>
      )}

      {/* Comments list */}
      <div className="comments-list">
        {loading ? (
          <p className="comments-loading">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first!</p>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="comment-item">
              <Avatar
                src={comment.userId?.profileImage}
                alt={comment.userId?.fullName}
                size="sm"
                userId={comment.userId?._id}
              />
              <div className="comment-content">
                <div className="comment-header">
                  <Link to={`/profile/${comment.userId?._id}`} className="comment-username">
                    {comment.userId?.username}
                  </Link>
                  {editingId === comment._id ? (
                    <div className="comment-edit">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={300}
                      />
                      <button onClick={() => handleEdit(comment._id)}><FaCheck /></button>
                      <button onClick={() => setEditingId(null)}><FaTimes /></button>
                    </div>
                  ) : (
                    <span className="comment-text">{comment.text}</span>
                  )}
                </div>
                {user && user._id === comment.userId?._id && editingId !== comment._id && (
                  <div className="comment-actions">
                    <button onClick={() => { setEditingId(comment._id); setEditText(comment.text); }}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(comment._id)} className="danger">
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
