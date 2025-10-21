import React from 'react';
import { LogBox } from 'react-native';
import * as ariaSsr from '@react-aria/ssr';
import * as ariaUtils from '@react-native-aria/utils';

// Comprehensive warning and error suppression
LogBox.ignoreAllLogs(true);

// Disable console warnings and errors
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

console.warn = (...args) => {
  // Only show warnings in development if needed
  if (__DEV__ && false) {
    originalWarn(...args);
  }
};

console.error = (...args) => {
  // Only show errors in development if needed
  if (__DEV__ && false) {
    originalError(...args);
  }
};

console.log = (...args) => {
  // Only show logs in development if needed
  if (__DEV__ && false) {
    originalLog(...args);
  }
};

// NativeBase wraps the app with SSRProvider even in React 18, which logs a warning.
// Replace it with a no-op provider (React.Fragment) when useId is available.
(() => {
  const createSilentProvider = original => props => {
    if (typeof React.useId === 'function') {
      return <React.Fragment>{props.children}</React.Fragment>;
    }

    return original(props);
  };

  const overrideModule = (module, key = 'SSRProvider') => {
    if (!module || typeof module[key] !== 'function') {
      return;
    }

    const original = module[key];

    try {
      Object.defineProperty(module, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: createSilentProvider(original),
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to override SSRProvider warning handler:', error);
      }
    }
  };

  overrideModule(ariaSsr);
  overrideModule(ariaUtils);
})();
