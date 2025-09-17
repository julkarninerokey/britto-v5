// Payment Configuration
export const PAYMENT_CONFIG = {
  // Set to true for direct payment (skip Payment screen)
  // Set to false to show Payment screen first
  DIRECT_PAYMENT: true,
  
  // Auto-open payment gateway after enrollment
  AUTO_OPEN_PAYMENT: true,
  
  // Show payment confirmation before opening gateway
  SHOW_PAYMENT_CONFIRMATION: false,
  
  // Timeout for payment initialization (in milliseconds)
  PAYMENT_TIMEOUT: 30000,
};

// Helper function to check if direct payment is enabled
export const isDirectPaymentEnabled = () => {
  return PAYMENT_CONFIG.DIRECT_PAYMENT;
};

// Helper function to check if auto payment is enabled
export const isAutoPaymentEnabled = () => {
  return PAYMENT_CONFIG.AUTO_OPEN_PAYMENT;
};

// Helper function to check if payment confirmation should be shown
export const shouldShowPaymentConfirmation = () => {
  return PAYMENT_CONFIG.SHOW_PAYMENT_CONFIRMATION;
};
