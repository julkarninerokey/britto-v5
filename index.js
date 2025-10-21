/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Disable all warnings at the entry point
LogBox.ignoreAllLogs(true);

// Disable yellow box warnings globally
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App);
