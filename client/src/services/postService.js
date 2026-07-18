import api from './api';

const postService = {
  getPosts: (params = {}) => api.get('/posts', { params }).then(r => r.data),

  getTrending: (params = {}) => api.get('/posts/trending', { params }).then(r => r.data),

  getPostById: (id) => api.get(`/posts/${id}`).then(r => r.data),

  getPostsByUser: (userId, params = {}) =>
    api.get(`/posts/user/${userId}`, { params }).then(r => r.data),

  createPost: (formData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  updatePost: (id, postData) => api.put(`/posts/${id}`, postData).then(r => r.data),

  deletePost: (id) => api.delete(`/posts/${id}`).then(r => r.data),

  likePost: (id) => api.post(`/posts/${id}/like`).then(r => r.data),

  unlikePost: (id) => api.delete(`/posts/${id}/unlike`).then(r => r.data),
};

export default postService;
