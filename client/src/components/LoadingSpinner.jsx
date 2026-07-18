import './LoadingSpinner.css';

export function LoadingSpinner({ size = 'md' }) {
  return (
    <div className={`spinner-container`}>
      <div className={`spinner spinner-${size}`} />
    </div>
  );
}

export function SkeletonLoader({ type = 'post', count = 3 }) {
  if (type === 'post') {
    return (
      <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-post">
            <div className="skeleton-header">
              <div className="skeleton-avatar" />
              <div className="skeleton-user-info">
                <div className="skeleton-line skeleton-line-sm" />
                <div className="skeleton-line skeleton-line-xs" />
              </div>
            </div>
            <div className="skeleton-image" />
            <div className="skeleton-actions">
              <div className="skeleton-line skeleton-line-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'user') {
    return (
      <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-user">
            <div className="skeleton-avatar" />
            <div className="skeleton-user-info">
              <div className="skeleton-line skeleton-line-sm" />
              <div className="skeleton-line skeleton-line-xs" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <LoadingSpinner />;
}
