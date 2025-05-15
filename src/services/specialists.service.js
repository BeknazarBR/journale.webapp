import axios from 'axios';

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
}

export default new ServicesService();
