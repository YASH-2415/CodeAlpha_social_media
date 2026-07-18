import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import './EditProfilePage.css';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    bio: user?.bio || '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be under 2MB');
        return;
      }
      setProfileImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('username', formData.username);
      fd.append('fullName', formData.fullName);
      fd.append('bio', formData.bio);
      if (profileImageFile) fd.append('profileImage', profileImageFile);

      const updated = await userService.updateUser(user._id, fd);
      updateUser(updated);
      toast.success('Profile updated!');
      navigate(`/profile/${user._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="avatar-upload">
          <div className="avatar-preview">
            {previewImage ? (
              <img src={previewImage} alt="Preview" />
            ) : (
              <Avatar src={user?.profileImage} alt={user?.fullName} size="xl" />
            )}
            <button type="button" className="camera-btn" onClick={() => fileRef.current?.click()}>
              <FaCamera />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} hidden />
          <span className="upload-hint">Click camera to change photo</span>
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            maxLength={30}
          />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            maxLength={200}
            rows={4}
            placeholder="Tell us about yourself..."
          />
          <span className="char-count">{formData.bio.length}/200</span>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
