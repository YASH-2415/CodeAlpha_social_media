import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import Avatar from '../components/Avatar';
import FollowButton from '../components/FollowButton';
import PostCard from '../components/PostCard';
import { SkeletonLoader, LoadingSpinner } from '../components/LoadingSpinner';
import userService from '../services/userService';
import postService from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import './ProfilePage.css';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isSelf = currentUser && currentUser._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserById(id);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const data = await postService.getPostsByUser(id, { page, limit: 9 });
      const newPosts = data.posts || [];

      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      setHasMore(page < data.totalPages);
    } catch (error) {
      console.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setPage(1);
      setPosts([]);
      setHasMore(true);
    }
  }, [id]);

  useEffect(() => {
    fetchPosts();
  }, [page, id]);

  const loadMore = () => setPage(prev => prev + 1);
  const { ref } = useInfiniteScroll(loadMore, hasMore, postsLoading);

  if (loading) return <SkeletonLoader type="post" count={2} />;
  if (!profile) return <div className="error-page">User not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-cover" />
        <div className="profile-info">
          <Avatar src={profile.profileImage} alt={profile.fullName} size="xl" />
          <div className="profile-details">
            <div className="profile-top">
              <div>
                <h2>{profile.fullName}</h2>
                <p className="profile-username">@{profile.username}</p>
              </div>
              {isSelf ? (
                <Link to="/edit-profile" className="edit-profile-btn">
                  <FaEdit /> Edit Profile
                </Link>
              ) : (
                <FollowButton
                  userId={profile._id}
                  isFollowing={profile.isFollowing}
                  onToggle={(following) => {
                    setProfile(prev => ({
                      ...prev,
                      followers: following
                        ? [...(prev.followers || []), currentUser]
                        : (prev.followers || []).filter(f => f._id !== currentUser._id),
                    }));
                  }}
                />
              )}
            </div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-stats">
              <div className="stat">
                <strong>{profile.postCount || 0}</strong>
                <span>Posts</span>
              </div>
              <Link to={`/profile/${profile._id}/followers`} className="stat">
                <strong>{(profile.followers || []).length}</strong>
                <span>Followers</span>
              </Link>
              <Link to={`/profile/${profile._id}/following`} className="stat">
                <strong>{(profile.following || []).length}</strong>
                <span>Following</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <h3>Posts</h3>
        {posts.length === 0 && !postsLoading ? (
          <p className="no-posts">No posts yet</p>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={(postId) => setPosts(prev => prev.filter(p => p._id !== postId))}
              />
            ))}
            {hasMore && <div ref={ref}><LoadingSpinner size="sm" /></div>}
          </>
        )}
      </div>
    </div>
  );
}
