/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Console management is now handled in App.tsx via consoleManager
AppRegistry.registerComponent(appName, () => App);
