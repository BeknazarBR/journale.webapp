import axios from "axios";
import authHeader from './auth-header';

const API_URL = "http://localhost:3000/auth/";

class AuthService {
  login(email, password) {
    return axios
      .post(API_URL + "sign-in", {
        email,
        password
      })
      .then(response => {
        if (response.data.access_token) {
          localStorage.setItem("access_token", response.data.access_token);
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("access_token");
  }

  register(fio, email, password) {
    return axios.post(API_URL + "signup", {
      fio,
      email,
      password
    });
  }

  getCurrentUser() {
    return axios.get(API_URL + "me", {
      headers: authHeader(),
    }).then(response => {
      return response.data;
    });
  }
}

export default new AuthService();
