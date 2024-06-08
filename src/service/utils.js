import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import {showMessage} from 'react-native-flash-message';
import {version} from '../../package.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkUserLoginStatus = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

export const saveLogin = async (loginData, reg) => {
  try {
    await AsyncStorage.setItem('reg', reg);
    await AsyncStorage.setItem('token', JSON.stringify(loginData?.token));
    await AsyncStorage.setItem('photo', loginData?.photo);
    await AsyncStorage.setItem('name', loginData?.name);
    await AsyncStorage.setItem('hall', loginData?.hall);
    await AsyncStorage.setItem('dept', loginData?.dept);
    await AsyncStorage.setItem(
      'dashboard',
      JSON.stringify(loginData?.dashboard),
    ); // Ensure this is properly stringified if it is an object

    return true;
  } catch (error) {
    console.error('Login Error:', error);
  }
};

export const toast = (type, title, desc) => {
  showMessage({
    message: title,
    description: desc,
    type: type,
  });
};

export const deviceInfo = () => {
  return {
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    systemName: DeviceInfo.getSystemName(),
    systemVersion: DeviceInfo.getSystemVersion(),
    uniqueId: DeviceInfo.getUniqueId(),
    // Add more properties as needed
  };
};

export const netInfo = async () => {
  const state = await NetInfo.fetch();
  const ip = state.details.ipAddress; // This may vary depending on how NetInfo provides details

  return {ip, state};
};

export const appInfo = async () => {
  return version;
};

// For application installation info, you might need to implement custom methods or find suitable packages
// react-native-device-info provides some relevant methods
export const appInstallInfo = async () => {
  const time = DeviceInfo.getInstallReferrer(); // This may need a custom implementation
  const from = DeviceInfo.getInstallSource(); // This may need a custom implementation

  return {time, from};
};

export const color = {
  primary: '#191970', // Brand color (navy blue)
  secondary: '#6c757d', // Dark gray
  text: '#343a40', // Dark text color
  background: '#ffffff', // White background
  secondaryBackground: '#f8f9fa', // Light gray for secondary background
  accent: '#fd7e14', // Orange accent color
  success: '#28a745', // Success color (green)
  danger: '#dc3545', // Danger color (red)
  warning: '#ffc107', // Warning color (yellow)
  info: '#17a2b8', // Info color (cyan)
  gradientBackground: ['#191970', '#3d3e58', '#5f608a', '#8788b8', '#b4b5e0'], // Gradient background colors
};

export const defaultUserPhoto = require('../assets/icons/user.png');
// #### TO COMPLE ANDROID BUILD-------------

// #### sudo ./gradlew clean
// ##### sudo ./gradlew assembleDebug

// ####-----------------------------------
