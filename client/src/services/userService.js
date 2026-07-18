import api from './api';

const userService = {
  getUsers: (params = {}) => api.get('/users', { params }).then(r => r.data),

  getMe: () => api.get('/users/me').then(r => r.data),

  getUserById: (id) => api.get(`/users/${id}`).then(r => r.data),

  updateUser: (id, formData) =>
    api.put(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  followUser: (id) => api.post(`/users/${id}/follow`).then(r => r.data),

  unfollowUser: (id) => api.delete(`/users/${id}/unfollow`).then(r => r.data),

  getFollowers: (id, params = {}) =>
    api.get(`/users/${id}/followers`, { params }).then(r => r.data),

  getFollowing: (id, params = {}) =>
    api.get(`/users/${id}/following`, { params }).then(r => r.data),

  getDashboard: () => api.get('/users/dashboard').then(r => r.data),

  deleteUser: (id) => api.delete(`/users/${id}`).then(r => r.data),
};

export default userService;
