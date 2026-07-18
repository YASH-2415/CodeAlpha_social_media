import api from './api';

const searchService = {
  search: (query, type = 'all', limit = 10) =>
    api.get('/search', { params: { query, type, limit } }).then(r => r.data),

  suggestions: (query, limit = 5) =>
    api.get('/search/suggestions', { params: { query, limit } }).then(r => r.data),
};

export default searchService;
