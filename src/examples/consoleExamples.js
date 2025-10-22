/**
 * Console Configuration Examples
 * 
 * Use this file as a reference for controlling console output
 */

import { ConsoleManager } from '../utils/consoleManager';
import CONSOLE_CONFIG from '../config/consoleConfig';

/**
 * Example: Enable both app and terminal logging
 */
export const enableAllLogging = () => {
  ConsoleManager.setAppLogging(true);
  ConsoleManager.setTerminalLogging(true);
  console.log('✅ All logging enabled');
};

/**
 * Example: Disable app warnings but keep terminal output
 */
export const disableAppKeepTerminal = () => {
  ConsoleManager.setAppLogging(false);
  ConsoleManager.setTerminalLogging(true);
  console.log('✅ App warnings disabled, terminal enabled');
};

/**
 * Example: Silent mode (no output anywhere)
 */
export const enableSilentMode = () => {
  ConsoleManager.setAppLogging(false);
  ConsoleManager.setTerminalLogging(false);
  ConsoleManager.forceLog('🔇 Silent mode enabled');
};

/**
 * Example: Debug mode (everything visible)
 */
export const enableDebugMode = () => {
  ConsoleManager.setAppLogging(true);
  ConsoleManager.setTerminalLogging(true);
  // Temporarily modify config for more verbose output
  CONSOLE_CONFIG.ALWAYS_SUPPRESS = []; // Don't suppress anything
  console.log('🐛 Debug mode enabled');
};

/**
 * Example: Production mode (clean app, minimal terminal)
 */
export const enableProductionMode = () => {
  ConsoleManager.setAppLogging(false);
  ConsoleManager.setTerminalLogging(true);
  // Only show errors and warnings in terminal
  CONSOLE_CONFIG.TERMINAL_LOGS = {
    LOG: false,
    WARN: true,
    ERROR: true,
    INFO: false,
    DEBUG: false,
  };
  console.warn('⚠️ Production mode enabled');
};

/**
 * Example: Force important messages (always visible)
 */
export const logImportantMessage = (message) => {
  ConsoleManager.forceLog('🚨 IMPORTANT:', message);
  ConsoleManager.forceError('🚨 IMPORTANT ERROR:', message);
};

/**
 * Example: Reset everything to default
 */
export const resetToDefault = () => {
  ConsoleManager.resetConsole();
  console.log('🔄 Console reset to default behavior');
};