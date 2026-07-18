const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getImageUrl(src) {
  if (!src || typeof src !== 'string') return null;

  const value = src.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

  if (value.startsWith('/')) {
    return `${base}${value}`;
  }

  return `${base}/${value}`;
}
