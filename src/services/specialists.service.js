import axios from 'axios';
import authHeader from "./auth-header";

const API_URL = 'http://localhost:3000/specialists';

class ServicesService {
  getByOrg(page = 1, limit = 10, orgId) {
    return axios.get(API_URL, {
      params: {
        organization_id: orgId,
        page,
        limit
      }
    });
  }
  create(data) {
    return axios.post(API_URL, data, {
      headers: authHeader(),
    })
  }
  assignService(data) {
    return axios.post(API_URL + '/assign-service', data, {
      headers: authHeader(),
    });
  }
}

export default new ServicesService();
