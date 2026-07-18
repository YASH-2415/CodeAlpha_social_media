import { useState, useRef } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from './Modal';
import postService from '../services/postService';
import './CreatePostModal.css';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      const post = await postService.createPost(formData);
      toast.success('Post created!');
      setCaption('');
      setImage(null);
      setPreview(null);
      onClose();
      if (onPostCreated) onPostCreated(post);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCaption('');
    setImage(null);
    setPreview(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Post" size="md">
      <div className="create-post">
        <div className="create-post-image">
          {preview ? (
            <>
              <img src={preview} alt="Preview" />
              <button className="remove-image" onClick={() => { setPreview(null); setImage(null); }}>
                <FaTimes />
              </button>
            </>
          ) : (
            <div className="upload-placeholder" onClick={() => fileRef.current?.click()}>
              <FaImage size={48} />
              <p>Click to select an image</p>
              <span>JPEG, PNG, GIF, WebP (max 5MB)</span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </div>

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          rows={4}
        />
        <div className="char-count">{caption.length}/500</div>

        <button
          className="create-post-btn"
          onClick={handleSubmit}
          disabled={loading || !image}
        >
          {loading ? 'Posting...' : 'Share Post'}
        </button>
      </div>
    </Modal>
  );
}
