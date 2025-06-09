export default function authHeader() {
  const access_token = localStorage.getItem('access_token');

  if (access_token) {
    return { Authorization: 'Bearer ' + access_token }; // for Spring Boot back-end
    // return { 'x-access-token': user.access_token };       // for Node.js Express back-end
  } else {
    return {};
  }
}
