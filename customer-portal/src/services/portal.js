import { apiClient } from './auth';

/**
 * Get customer profile
 * @returns {Promise<Object>}
 */
export async function getProfile() {
  const response = await apiClient.get('/portal/profile');
  return response.data.data;
}

/**
 * Update customer profile
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateProfile(updates) {
  const response = await apiClient.put('/portal/profile', updates);
  return response.data.data;
}

/**
 * Get all registrations for customer
 * @returns {Promise<Array>}
 */
export async function getRegistrations() {
  const response = await apiClient.get('/portal/registrations');
  return response.data.data.registrations;
}

/**
 * Create AU Alphanumeric Sender ID registration
 * @param {Object} registrationData
 * @returns {Promise<Object>}
 */
export async function createAuAlphanumericRegistration(registrationData) {
  const response = await apiClient.post('/portal/registrations/au-alphanumeric', registrationData);
  return response.data.data.registration;
}

/**
 * Get registration status
 * @param {string} registrationId
 * @returns {Promise<Object>}
 */
export async function getRegistrationStatus(registrationId) {
  const response = await apiClient.get(`/portal/registrations/${registrationId}/status`);
  return response.data.data.registration;
}

/**
 * Update registration
 * @param {string} registrationId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateRegistration(registrationId, updates) {
  const response = await apiClient.put(`/portal/registrations/${registrationId}`, updates);
  return response.data.data.registration;
}
