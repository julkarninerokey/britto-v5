/**
 * Console Configuration
 * Control console output for app and terminal separately
 */

const CONSOLE_CONFIG = {
  // Show console outputs in the app (LogBox, Yellow Box)
  SHOW_IN_APP: false,
  
  // Show console outputs in terminal/metro bundler
  SHOW_IN_TERMINAL: true,
  
  // Enable specific log levels in terminal
  TERMINAL_LOGS: {
    LOG: true,     // console.log
    WARN: true,    // console.warn  
    ERROR: true,   // console.error
    INFO: true,    // console.info
    DEBUG: true,   // console.debug
  },
  
  // Enable specific log levels in app
  APP_LOGS: {
    LOG: false,
    WARN: false,
    ERROR: false,
    INFO: false,
    DEBUG: false,
  },

  // Specific warnings to always suppress (even if SHOW_IN_APP is true)
  ALWAYS_SUPPRESS: [
    'VirtualizedLists should never be nested',
    'componentWillMount',
    'componentWillUpdate',
    'componentWillReceiveProps',
    'Setting a timer',
  ]
};

export default CONSOLE_CONFIG;