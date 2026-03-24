import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    if (process.env.REACT_APP_ENABLE_LOGGING === 'true') {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// ========================================
// Toll-free Verification APIs
// ========================================

export const initializeTollFree = async (data) => {
  const response = await apiClient.post('/compliance/tollfree/initialize', data);
  return response.data;
};

export const resumeTollFree = async (registrationId) => {
  const response = await apiClient.post('/compliance/tollfree/resume', { registrationId });
  return response.data;
};

// ========================================
// Customer Profile APIs
// ========================================

export const initializeCustomerProfile = async (data) => {
  const response = await apiClient.post('/compliance/customer-profile/initialize', data);
  return response.data;
};

export const resumeCustomerProfile = async (customerId) => {
  const response = await apiClient.post('/compliance/customer-profile/resume', { customerId });
  return response.data;
};

// ========================================
// Regulatory Bundle APIs
// ========================================

export const initializeRegulatoryBundle = async (data) => {
  const response = await apiClient.post('/compliance/regulatory-bundle/initialize', data);
  return response.data;
};

export const resumeRegulatoryBundle = async (registrationId) => {
  const response = await apiClient.post('/compliance/regulatory-bundle/resume', { registrationId });
  return response.data;
};

// ========================================
// Branded Calling APIs
// ========================================

export const initializeBrandedCalling = async (data) => {
  const response = await apiClient.post('/compliance/branded-calling/initialize', data);
  return response.data;
};

// ========================================
// Inquiry Management APIs
// ========================================

export const getInquiries = async () => {
  const response = await apiClient.get('/compliance/inquiries');
  return response.data;
};

export const getInquiry = async (id) => {
  const response = await apiClient.get(`/compliance/inquiries/${id}`);
  return response.data;
};

export default {
  initializeTollFree,
  resumeTollFree,
  initializeCustomerProfile,
  resumeCustomerProfile,
  initializeRegulatoryBundle,
  resumeRegulatoryBundle,
  initializeBrandedCalling,
  getInquiries,
  getInquiry
};
