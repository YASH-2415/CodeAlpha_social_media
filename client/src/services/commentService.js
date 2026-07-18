import api from './api';

const commentService = {
  createComment: (postId, text) =>
    api.post('/comments', { postId, text }).then(r => r.data),

  updateComment: (id, text) =>
    api.put(`/comments/${id}`, { text }).then(r => r.data),

  deleteComment: (id) => api.delete(`/comments/${id}`).then(r => r.data),

  getCommentsByPost: (postId, params = {}) =>
    api.get(`/comments/post/${postId}`, { params }).then(r => r.data),
};

export default commentService;
