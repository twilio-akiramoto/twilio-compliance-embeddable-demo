import { apiClient } from './auth';

/**
 * Get dashboard metrics
 * @param {string} timeRange - Time range (7d, 30d, 90d)
 * @returns {Promise<Object>}
 */
export async function getMetrics(timeRange = '30d') {
  const response = await apiClient.get('/dashboard/metrics', {
    params: { timeRange }
  });
  return response.data.data;
}

/**
 * Get all customers with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>}
 */
export async function getCustomers(filters = {}) {
  const response = await apiClient.get('/dashboard/customers', {
    params: filters
  });
  return response.data.data;
}

/**
 * Get customer by ID
 * @param {string} customerId
 * @returns {Promise<Object>}
 */
export async function getCustomerById(customerId) {
  const response = await apiClient.get(`/dashboard/customers/${customerId}`);
  return response.data.data.customer;
}

/**
 * Send invitation to customer
 * @param {Object} invitationData
 * @returns {Promise<Object>}
 */
export async function sendInvitation(invitationData) {
  const response = await apiClient.post('/dashboard/invitations', invitationData);
  return response.data.data;
}

/**
 * Resend invitation to customer
 * @param {string} customerId
 * @returns {Promise<Object>}
 */
export async function resendInvitation(customerId) {
  const response = await apiClient.post('/dashboard/invitations/resend', { customerId });
  return response.data.data;
}

/**
 * Get all registrations with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>}
 */
export async function getRegistrations(filters = {}) {
  const response = await apiClient.get('/dashboard/registrations', {
    params: filters
  });
  return response.data.data;
}

/**
 * Assign CSM to customer
 * @param {string} customerId
 * @param {string} csmId
 * @returns {Promise<Object>}
 */
export async function assignCSM(customerId, csmId) {
  const response = await apiClient.put(`/dashboard/customers/${customerId}/assign`, { csmId });
  return response.data.data.customer;
}

/**
 * Update customer status
 * @param {string} customerId
 * @param {string} status
 * @returns {Promise<Object>}
 */
export async function updateCustomerStatus(customerId, status) {
  const response = await apiClient.put(`/dashboard/customers/${customerId}/status`, { status });
  return response.data.data.customer;
}

/**
 * Reset the demo database
 * @returns {Promise<Object>}
 */
export async function resetDatabase() {
  const response = await apiClient.post('/dashboard/reset');
  return response.data;
}
