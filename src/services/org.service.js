import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:3000/organizations';

class OrgService {
  getPublicContent(page = 1, limit = 10) {
    return axios.get(API_URL, {
      params: {
        page,
        limit
      }
    });
  }

  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new OrgService();
