// API Configuration
export const API_CONFIG = {
  // Main API endpoints
  BASE_URL: 'https://appapi.eco.du.ac.bd',
  
  // Payment API endpoints (different base URL)
  PAYMENT_BASE_URL: 'https://student.eco.du.ac.bd',
  
  // Legacy API (if still needed)
  LEGACY_BASE_URL: 'https://resapi.eco.du.ac.bd/api/britto',
  
  // API endpoints
  ENDPOINTS: {
    LOGIN: '/login',
    STUDENT_ME: '/student/me',
    GET_FILE: '/get-file',
    GET_ALL_ENROLLMENTS: '/student/get-all-enrollments',
    GET_YEAR_SEMESTER_FOR_ENROLLMENT: '/student/get-year-semester-for-enrollmen',
    GET_PAYMENT_HEAD: '/student/get-payment-head',
    
    // Payment endpoints (these use PAYMENT_BASE_URL)
    PAYMENT_APPLICATION_DETAILS: '/student/application/payment-details',
    PAYMENT_SSL: '/api/payment/ssl',
    PAYMENT_VERIFY: '/student/payment/verify',
    PAYMENT_STATUS: '/student/payment/status',
    SUBMIT_ENROLLED_COURSES: '/student/submit-enrolled-courses',
  },
  
  // Headers
  HEADERS: {
    CONTENT_TYPE: 'application/json',
  },
  
  // API Token for legacy system
  LEGACY_API_TOKEN: '8f3c1e2d3a4b5c6d7e8f9a0b1c2d3e4f',
};

// Helper functions to build URLs
export const buildUrl = (endpoint: string, baseUrl: string = API_CONFIG.BASE_URL): string => {
  return `${baseUrl}${endpoint}`;
};

// Helper function specifically for payment URLs
export const buildPaymentUrl = (endpoint: string): string => {
  // Payment endpoints use the student portal base URL
  const paymentEndpoints = ['/api/payment/ssl', '/student/payment/verify', '/student/payment/status'];
  const shouldUsePaymentBase = paymentEndpoints.some(paymentEndpoint => endpoint.includes(paymentEndpoint));
  
  const baseUrl = shouldUsePaymentBase ? API_CONFIG.PAYMENT_BASE_URL : API_CONFIG.BASE_URL;
  return `${baseUrl}${endpoint}`;
};

export const buildFileUrl = (fileName: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_FILE}/${fileName}`;
};
