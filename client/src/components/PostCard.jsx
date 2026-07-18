import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaRegComment, FaEllipsisH, FaTrash, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import postService from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import './PostCard.css';
import { getImageUrl } from '../utils/imageUrl';

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label} ago`;
  }
  return 'Just now';
}

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [likeAnimating, setLikeAnimating] = useState(false);

  const isOwner = user && post.userId && user._id === post.userId._id;

  const handleLike = async () => {
    try {
      if (liked) {
        await postService.unlikePost(post._id);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        setLikeAnimating(true);
        await postService.likePost(post._id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
        setTimeout(() => setLikeAnimating(false), 600);
      }
    } catch (error) {
      toast.error('Could not update like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted');
      if (onDelete) onDelete(post._id);
    } catch (error) {
      toast.error('Could not delete post');
    }
  };

  const handleEdit = async () => {
    try {
      await postService.updatePost(post._id, { caption: editCaption });
      toast.success('Post updated');
      setEditing(false);
      if (onUpdate) onUpdate(post._id, editCaption);
    } catch (error) {
      toast.error('Could not update post');
    }
  };

  const handleDoubleTapLike = () => {
    if (!liked) handleLike();
    else {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 600);
    }
  };

  return (
    <motion.div
      className="post-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="post-header">
        <div className="post-user">
          <Avatar
            src={post.userId?.profileImage}
            alt={post.userId?.fullName}
            size="sm"
            userId={post.userId?._id}
          />
          <div className="post-user-info">
            <Link to={`/profile/${post.userId?._id}`} className="post-username">
              {post.userId?.username}
            </Link>
            <span className="post-fullname">{post.userId?.fullName}</span>
          </div>
        </div>
        <div className="post-menu">
          <span className="post-time">{timeAgo(post.createdAt)}</span>
          {isOwner && (
            <div className="post-menu-dropdown">
              <button onClick={() => setShowMenu(!showMenu)}><FaEllipsisH /></button>
              {showMenu && (
                <div className="dropdown-menu">
                  <button onClick={() => { setEditing(true); setShowMenu(false); }}><FaEdit /> Edit</button>
                  <button onClick={() => { handleDelete(); setShowMenu(false); }} className="danger"><FaTrash /> Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="post-image" onDoubleClick={handleDoubleTapLike}>
        {post.image ? <img src={getImageUrl(post.image)} alt="Post" loading="lazy" /> : null}
        {likeAnimating && (
          <motion.div
            className="like-animation"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FaHeart />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <div className="post-actions-left">
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            {liked ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button className="comment-btn" onClick={() => setShowComments(!showComments)}>
            <FaRegComment />
          </button>
        </div>
        <span className="like-count">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
      </div>

      {/* Caption */}
      {editing ? (
        <div className="post-edit">
          <textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="post-edit-actions">
            <button onClick={handleEdit} className="btn-primary-sm">Save</button>
            <button onClick={() => setEditing(false)} className="btn-ghost-sm">Cancel</button>
          </div>
        </div>
      ) : (
        post.caption && (
          <div className="post-caption">
            <Link to={`/profile/${post.userId?._id}`} className="post-username">{post.userId?.username}</Link>
            <span>{post.caption}</span>
          </div>
        )
      )}

      {/* Comments section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          commentCount={post.commentCount}
        />
      )}
    </motion.div>
  );
}
