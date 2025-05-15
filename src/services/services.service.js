import axios from 'axios';

const API_URL = 'http://localhost:3000/services';

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
  getServicesBySpecialist(page = 1, limit = 10, specialistId) {
    return axios.get(API_URL + '/list/by-specialist', {
      params: {
        specialist_id: specialistId,
        page,
        limit
      }
    });
  }
}

export default new ServicesService();
