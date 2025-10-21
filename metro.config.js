const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

// Suppress console warnings during bundling
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args) => {
  const message = args.join(' ');
  // Suppress common warnings
  if (
    message.includes('VirtualizedLists') ||
    message.includes('componentWillReceiveProps') ||
    message.includes('componentWillMount') ||
    message.includes('Warning:') ||
    message.includes('Failed prop type')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

console.error = (...args) => {
  const message = args.join(' ');
  // Suppress common errors that are actually warnings
  if (
    message.includes('Warning:') ||
    message.includes('VirtualizedLists') ||
    message.includes('componentWill')
  ) {
    return;
  }
  originalConsoleError(...args);
};

const config = {
  resolver: {
    // Suppress resolver warnings
    unstable_enablePackageExports: true,
  },
  transformer: {
    // Suppress transformer warnings
    unstable_allowRequireContext: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
