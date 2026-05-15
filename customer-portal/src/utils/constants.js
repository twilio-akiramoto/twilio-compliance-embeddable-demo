// Product Types
export const PRODUCTS = {
  TOLLFREE: 'tollfree',
  CUSTOMER_PROFILE: 'customer-profile',
  REGULATORY_BUNDLE: 'regulatory-bundle',
  BRANDED_CALLING: 'branded-calling',
  AU_ALPHANUMERIC: 'au-alphanumeric'
};

// Phone Number Types for Toll-free and RC Bundles
export const PHONE_NUMBER_TYPES = {
  TOLLFREE: 'tollfree',
  LOCAL: 'local',
  MOBILE: 'mobile',
  NATIONAL: 'national'
};

// End User Types
export const END_USER_TYPES = {
  BUSINESS: 'Business',
  INDIVIDUAL: 'Individual'
};

// RC Bundle specific types
export const RC_NUMBER_TYPES = [
  { value: 'LOCAL_PHONE_NUMBER', label: 'Local' },
  { value: 'MOBILE_PHONE_NUMBER', label: 'Mobile' },
  { value: 'NATIONAL_PHONE_NUMBER', label: 'National' },
  { value: 'TOLLFREE_PHONE_NUMBER', label: 'Toll-free' }
];

export const RC_END_USER_TYPES = [
  { value: 'BUSINESS', label: 'Business' },
  { value: 'INDIVIDUAL', label: 'Individual' }
];

// Country codes for RC Bundles (Wave 1, 2, 3 countries)
export const COUNTRIES = [
  // Wave 1 - Dec 9, 2024
  { code: 'AU', name: 'Australia', wave: 1 },
  { code: 'BR', name: 'Brazil', wave: 1 },
  { code: 'DE', name: 'Germany', wave: 1 },
  { code: 'MX', name: 'Mexico', wave: 1 },
  { code: 'ES', name: 'Spain', wave: 1 },

  // Wave 2 - Jan 17, 2025 (selection of common countries)
  { code: 'US', name: 'United States', wave: 2 },
  { code: 'GB', name: 'United Kingdom', wave: 2 },
  { code: 'CA', name: 'Canada', wave: 2 },
  { code: 'IT', name: 'Italy', wave: 2 },
  { code: 'NL', name: 'Netherlands', wave: 2 },
  { code: 'BE', name: 'Belgium', wave: 2 },
  { code: 'CH', name: 'Switzerland', wave: 2 },
  { code: 'SE', name: 'Sweden', wave: 2 },
  { code: 'NO', name: 'Norway', wave: 2 },
  { code: 'DK', name: 'Denmark', wave: 2 },
  { code: 'FI', name: 'Finland', wave: 2 },
  { code: 'AT', name: 'Austria', wave: 2 },
  { code: 'PL', name: 'Poland', wave: 2 },
  { code: 'CZ', name: 'Czech Republic', wave: 2 },
  { code: 'GR', name: 'Greece', wave: 2 },
  { code: 'PT', name: 'Portugal', wave: 2 },
  { code: 'IE', name: 'Ireland', wave: 2 },
  { code: 'NZ', name: 'New Zealand', wave: 2 },
  { code: 'SG', name: 'Singapore', wave: 2 },
  { code: 'HK', name: 'Hong Kong', wave: 2 },
  { code: 'IL', name: 'Israel', wave: 2 },

  // Wave 3 - Feb 28, 2025
  { code: 'JP', name: 'Japan', wave: 3 },
  { code: 'SV', name: 'El Salvador', wave: 3 },
  { code: 'FR', name: 'France', wave: 3 },
  { code: 'KE', name: 'Kenya', wave: 3 },
  { code: 'RO', name: 'Romania', wave: 3 }
];

// Inquiry Status Types
export const INQUIRY_STATUS = {
  INITIALIZED: 'initialized',
  RESUMED: 'resumed',
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending-review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Status Colors
export const STATUS_COLORS = {
  [INQUIRY_STATUS.INITIALIZED]: '#0066CC',
  [INQUIRY_STATUS.RESUMED]: '#0066CC',
  [INQUIRY_STATUS.DRAFT]: '#FFA500',
  [INQUIRY_STATUS.PENDING_REVIEW]: '#9966FF',
  [INQUIRY_STATUS.APPROVED]: '#00CC66',
  [INQUIRY_STATUS.REJECTED]: '#FF3333'
};

// Australia Alphanumeric Sender ID specific constants
export const AU_SENDER_ID_PROOF_TYPES = [
  { value: 'Company Extract', label: 'Company Extract' },
  { value: 'Australian Business Names Register', label: 'Australian Business Names Register (ABNR)' },
  { value: '.au Domain', label: '.au Domain' },
  { value: 'Australian Trademark', label: 'Australian Trademark' },
  { value: 'International Trademark', label: 'International Trademark' },
  { value: 'Other', label: 'Other' }
];

export const AU_USE_CASE_CATEGORIES = [
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'TRANSACTIONAL', label: 'Transactional' }
];

export const AU_MESSAGE_VOLUMES = [
  { value: '1-1000', label: '1 - 1,000' },
  { value: '1000-10000', label: '1,000 - 10,000' },
  { value: '10000-100000', label: '10,000 - 100,000' },
  { value: '100000+', label: '100,000+' }
];
