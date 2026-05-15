import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const TOKEN_KEY = 'customerPortalToken';

/**
 * Axios instance with auth header interceptor
 */
const apiClient = axios.create({
  baseURL: API_URL
});

// Add token to requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} User and token
 */
export async function login(email, password) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });

  if (response.data.success) {
    const { token, user } = response.data.data;
    setToken(token);
    return { token, user };
  }

  throw new Error('Login failed');
}

/**
 * Register new customer account with invitation token
 * @param {Object} userData
 * @returns {Promise<Object>} User and token
 */
export async function register(userData) {
  const response = await axios.post(`${API_URL}/auth/signup`, userData);

  if (response.data.success) {
    const { token, user } = response.data.data;
    setToken(token);
    return { token, user };
  }

  throw new Error('Registration failed');
}

/**
 * Verify invitation token
 * @param {string} token
 * @returns {Promise<Object>} Customer info
 */
export async function verifyInvitationToken(token) {
  const response = await axios.get(`${API_URL}/auth/invitation/${token}`);

  if (response.data.success) {
    return response.data.data;
  }

  throw new Error('Invalid invitation token');
}

/**
 * Verify JWT token
 * @returns {Promise<Object>} User info
 */
export async function verifyToken() {
  const response = await apiClient.post('/auth/verify-token');

  if (response.data.success) {
    return response.data.data.user;
  }

  throw new Error('Token verification failed');
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get current token
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set token
 * @param {string} token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Get current user from token (decode JWT)
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export { apiClient };
