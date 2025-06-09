import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:3000/registrations';

class BookService {
  bookService(data) {
    return axios.post(API_URL, data, {
      headers: authHeader(),
    });
  }
  getUserBookings(page = 1, limit = 10) {
    return axios.get(API_URL, {
      params: {
        page,
        limit,
      },
      headers: authHeader(),
    });
  }
  getOrgBookings(page = 1, limit = 10, orgId) {
    return axios.get(API_URL + '/org/appointments', {
      params: {
        page,
        limit,
        org_id: orgId
      },
      headers: authHeader(),
    });
  }
}

export default new BookService();
