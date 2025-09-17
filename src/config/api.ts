// API Configuration
export const API_CONFIG = {
  // Main API endpoints
  BASE_URL: 'https://appapi.eco.du.ac.bd',
  
  // Legacy API (if still needed)
  LEGACY_BASE_URL: 'https://du-backend.pitech.com.bd/api/britto',
  
  // API endpoints
  ENDPOINTS: {
    LOGIN: '/login',
    STUDENT_ME: '/student/me',
    GET_FILE: '/get-file',
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

export const buildFileUrl = (fileName: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_FILE}/${fileName}`;
};
