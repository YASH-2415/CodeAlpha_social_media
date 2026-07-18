import { Link } from 'react-router-dom';
import './Avatar.css';
import { getImageUrl } from '../utils/imageUrl';

export default function Avatar({ src, alt, size = 'md', userId, className = '' }) {
  const sizes = { sm: '32px', md: '44px', lg: '64px', xl: '120px' };
  const imgSrc = getImageUrl(src);

  const avatar = (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ width: sizes[size], height: sizes[size] }}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={alt || 'User avatar'} />
      ) : (
        <div className="avatar-fallback">
          {(alt || 'U').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  if (userId) {
    return <Link to={`/profile/${userId}`}>{avatar}</Link>;
  }

  return avatar;
}
