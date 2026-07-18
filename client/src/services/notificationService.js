import api from './api';

const notificationService = {
  getNotifications: (params = {}) =>
    api.get('/notifications', { params }).then(r => r.data),

  markAsRead: (id) => api.put(`/notifications/${id}/read`).then(r => r.data),

  markAllAsRead: () => api.put('/notifications/read-all').then(r => r.data),

  deleteNotification: (id) => api.delete(`/notifications/${id}`).then(r => r.data),
};

export default notificationService;
