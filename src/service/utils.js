import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import {showMessage} from 'react-native-flash-message';
import {version} from '../../package.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://172.20.10.8:4100/api/britto';
export const API_SECRET_TOKEN = '8f3c1e2d3a4b5c6d7e8f9a0b1c2d3e4f';

export const checkUserLoginStatus = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

export const saveLogin = async (loginData2, reg) => {
  try {
    const user = loginData2?.data || {};
    await AsyncStorage.setItem('reg', (reg || user.reg || '').toString());
    // Only save token if it exists
    if (loginData2?.token) {
      await AsyncStorage.setItem('token', JSON.stringify(loginData2.token));
    }
    await AsyncStorage.setItem('photo', user.photo || '');
    await AsyncStorage.setItem('name', user.name || '');
    await AsyncStorage.setItem('hall', user.hall || '');
    await AsyncStorage.setItem('dept', user.dept || '');
    await AsyncStorage.setItem(
      'dashboard',
      JSON.stringify(user.dashboard || []),
    );

    return true;
  } catch (error) {
    console.error('Login Save Error:', error);
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
  // Removed call to checkNetworkConnection to prevent infinite recursion
  const state = await NetInfo.fetch();
  const ip = state.details?.ipAddress; // Use optional chaining for safety
  return {ip, state};
};

export const appInfo = async () => {
  return version;
};

// Function to check network connection and handle the response
async function checkNetworkConnection() {
  try {
    const { state } = await netInfo();
    if (state.isConnected && state.isInternetReachable) {
      return state;
      console.log('Internet is reachable');  
    } else {
       console.log('No internet connection or internet is not reachable');
    }
  } catch (error) {
    console.error('Error fetching network information:', error);
  }
}

// Add an event listener to monitor network changes
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    checkNetworkConnection();
  } else {
    console.log('No network connection');
  }
});

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
// Format ISO date string (e.g., 1999-06-22T18:00:00.000Z) to DD-MM-YYYY
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Formats address fields into a single string, checking each for existence
export function formatAddress(addressObj) {
  if (!addressObj || typeof addressObj !== 'object') return '';
  const parts = [
    addressObj.present_house_no,
    addressObj.present_house_road,
    addressObj.present_post_office,
    addressObj.present_post_code,
    addressObj.present_police_station,
    addressObj.present_upa_zilla,
    addressObj.present_district,
  ];
  // Filter out null/undefined/empty values and join with comma
  return parts.filter(Boolean).join(', ');
}

// Returns full address string for present or permanent address based on type
export function getFullAddress(data, type = 'present') {
  if (!data || typeof data !== 'object') return '';
  if (type === 'present') {
    return formatAddress({
      present_house_no: data.present_house_no,
      present_house_road: data.present_house_road,
      present_post_office: data.present_post_office,
      present_post_code: data.present_post_code,
      present_police_station: data.present_police_station,
      present_upa_zilla: data.present_upa_zilla,
      present_district: data.present_district,
    });
  } else {
    return formatAddress({
      present_house_no: data.house_no, // fallback to house_no
      present_house_road: data.house_road, // fallback to house_road
      present_post_office: data.post_office,
      present_post_code: data.post_code,
      present_police_station: data.police_station,
      present_upa_zilla: data.upa_zilla,
      present_district: data.district,
    });
  }
}
