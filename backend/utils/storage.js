/**
 * In-memory storage for compliance inquiries
 * For production, replace with a database (PostgreSQL, MongoDB, etc.)
 */

const inquiries = new Map();

/**
 * Save inquiry data
 */
function saveInquiry(data) {
  const inquiry = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  inquiries.set(data.inquiryId, inquiry);
  console.log(`💾 Saved inquiry ${data.inquiryId} (${data.product})`);

  return inquiry;
}

/**
 * Get inquiry by ID
 */
function getInquiry(inquiryId) {
  return inquiries.get(inquiryId);
}

/**
 * Get all inquiries
 */
function getAllInquiries() {
  return Array.from(inquiries.values()).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Update inquiry status
 */
function updateStatus(inquiryId, status) {
  const inquiry = inquiries.get(inquiryId);
  if (inquiry) {
    inquiry.status = status;
    inquiry.updatedAt = new Date().toISOString();
    inquiries.set(inquiryId, inquiry);
    console.log(`📝 Updated inquiry ${inquiryId} status to: ${status}`);
    return inquiry;
  }
  return null;
}

/**
 * Clear all inquiries (for testing)
 */
function clearAll() {
  inquiries.clear();
  console.log('🗑️  Cleared all inquiries');
}

module.exports = {
  saveInquiry,
  getInquiry,
  getAllInquiries,
  updateStatus,
  clearAll
};
