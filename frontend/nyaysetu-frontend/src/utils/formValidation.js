/**
 * Centralized form validation helper functions
 */

export const validateAadhaar = (aadhaar) => {
  const clean = aadhaar.replace(/\s+/g, '');
  if (!/^\d{12}$/.test(clean)) {
    return 'Aadhaar must be exactly 12 digits';
  }
  return null;
};

export const validatePhoneNumber = (phone) => {
  const clean = phone.replace(/[\s-+]/g, '');
  if (!/^\d{10,12}$/.test(clean)) {
    return 'Phone number must be between 10 and 12 digits';
  }
  return null;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return 'Invalid email address format';
  }
  return null;
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};
