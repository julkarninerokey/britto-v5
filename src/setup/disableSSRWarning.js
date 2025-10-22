import React from 'react';
import * as ariaSsr from '@react-aria/ssr';
import * as ariaUtils from '@react-native-aria/utils';

// Console management is now handled by consoleManager.ts
// This file only handles SSR warnings

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
