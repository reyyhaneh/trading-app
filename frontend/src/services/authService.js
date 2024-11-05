import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

export const register = (user) => {
  return axios.post(`${API_URL}register`, user);
};

export const login = async (user) => {
  const response = await axios.post(`${API_URL}login`, user);
  if (response.data.token) {
    const { token, user } = response.data;
    localStorage.setItem('user', JSON.stringify({ email: user.email, token }));


    //localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
