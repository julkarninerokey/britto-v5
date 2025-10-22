import { LogBox } from 'react-native';
import CONSOLE_CONFIG from '../config/consoleConfig';

/**
 * Console Manager
 * Manages console output based on configuration
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

/**
 * Setup console based on configuration
 */
export const setupConsole = () => {
  // Configure LogBox (App warnings)
  if (CONSOLE_CONFIG.SHOW_IN_APP) {
    // Show warnings in app but suppress specific ones
    LogBox.ignoreLogs(CONSOLE_CONFIG.ALWAYS_SUPPRESS);
  } else {
    // Suppress all warnings in app
    LogBox.ignoreAllLogs(true);
  }

  // Configure console methods
  console.log = createConsoleMethod('log', originalConsole.log);
  console.warn = createConsoleMethod('warn', originalConsole.warn);
  console.error = createConsoleMethod('error', originalConsole.error);
  console.info = createConsoleMethod('info', originalConsole.info);
  console.debug = createConsoleMethod('debug', originalConsole.debug);

  // Legacy yellow box support
  (console as any).disableYellowBox = !CONSOLE_CONFIG.SHOW_IN_APP;
};

/**
 * Create a console method that respects configuration
 */
const createConsoleMethod = (level: string, originalMethod: Function) => {
  return (...args: any[]) => {
    const message = args.join(' ');
    
    // Check if this message should be suppressed
    const shouldSuppress = CONSOLE_CONFIG.ALWAYS_SUPPRESS.some(pattern => 
      message.includes(pattern)
    );
    
    if (shouldSuppress) {
      // Only show in terminal if configured
      if (CONSOLE_CONFIG.SHOW_IN_TERMINAL && getTerminalLogSetting(level)) {
        originalMethod(...args);
      }
      return;
    }
    
    // Show in terminal based on configuration
    if (CONSOLE_CONFIG.SHOW_IN_TERMINAL && getTerminalLogSetting(level)) {
      originalMethod(...args);
    }
  };
};

/**
 * Get terminal log setting for specific level
 */
const getTerminalLogSetting = (level: string): boolean => {
  switch (level.toLowerCase()) {
    case 'log': return CONSOLE_CONFIG.TERMINAL_LOGS.LOG;
    case 'warn': return CONSOLE_CONFIG.TERMINAL_LOGS.WARN;
    case 'error': return CONSOLE_CONFIG.TERMINAL_LOGS.ERROR;
    case 'info': return CONSOLE_CONFIG.TERMINAL_LOGS.INFO;
    case 'debug': return CONSOLE_CONFIG.TERMINAL_LOGS.DEBUG;
    default: return true;
  }
};

/**
 * Utility functions for runtime control
 */
export const ConsoleManager = {
  // Enable/disable app warnings
  setAppLogging: (enabled: boolean) => {
    CONSOLE_CONFIG.SHOW_IN_APP = enabled;
    setupConsole();
  },
  
  // Enable/disable terminal logging
  setTerminalLogging: (enabled: boolean) => {
    CONSOLE_CONFIG.SHOW_IN_TERMINAL = enabled;
    setupConsole();
  },
  
  // Get current config
  getConfig: () => ({ ...CONSOLE_CONFIG }),
  
  // Reset to original console
  resetConsole: () => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    LogBox.ignoreAllLogs(false);
  },
  
  // Force log something to terminal (bypasses all filters)
  forceLog: (...args: any[]) => {
    originalConsole.log('[FORCE]', ...args);
  },
  
  // Force error to terminal (bypasses all filters)
  forceError: (...args: any[]) => {
    originalConsole.error('[FORCE]', ...args);
  }
};