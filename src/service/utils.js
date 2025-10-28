import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import {showMessage} from 'react-native-flash-message';
import {version} from '../../package.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// Legacy API URL - now imported from centralized config
export const API_URL = API_CONFIG.LEGACY_BASE_URL;
export const API_SECRET_TOKEN = API_CONFIG.LEGACY_API_TOKEN;

export const checkUserLoginStatus = async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
};

//

export const dashboardButtons = [
  {
    id: 1,
    screen: "Profile",
    title: "Profile",
    priority: 1,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/profile.png",
    status: 1,
    createdAt: "2024-04-25 01:47:05",
  },
  // {
  //   id: 3,
  //   screen: "Enrollment",
  //   title: "Enrollment",
  //   priority: 7,
  //   icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/enrollment.png",
  //   status: 1,
  //   createdAt: "2024-04-25 12:19:18",
  // },
  {
    id: 2,
    screen: "FormFillup",
    title: "Form Fill-up",
    priority: 7,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/form-fillup.png",
    status: 1,
    createdAt: "2024-04-25 12:19:18",
  },
  {
    id: 6,
    screen: "Result",
    title: "Result",
    priority: 8,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/result.png",
    status: 1,
    createdAt: "2024-04-25 12:19:18",
  },
  {
    id: 7,
    screen: "Marksheet",
    title: "Marksheet",
    priority: 9,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/document.png",
    status: 1,
    createdAt: "2024-04-25 12:23:34",
  },
  {
    id: 8,
    screen: "Certificate",
    title: "Certificate",
    priority: 10,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/certificate.png",
    status: 1,
    createdAt: "2024-04-25 12:23:34",
  },
  {
    id: 9,
    screen: "Notice",
    title: "Notice",
    priority: 6,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/notice.png",
    status: 1,
    createdAt: "2024-04-25 12:26:34",
  },
  {
    id: 10,
    screen: "Hall",
    title: "Hall",
    priority: 2,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/hall.png",
    status: 1,
    createdAt: "2024-04-25 12:31:48",
  },
  {
    id: 11,
    screen: "Syllabus",
    title: "Syllabus",
    priority: 5,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/book.png",
    status: 1,
    createdAt: "2024-04-25 12:31:48",
  },
  {
    id: 20,
    screen: "Department",
    title: "Department",
    priority: 3,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/department.png",
    status: 1,
    createdAt: "2024-04-25 01:47:05",
  },
  {
    id: 21,
    screen: "Department",
    title: "Class Schedule",
    priority: 100,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/class.png",
    status: 0,
    createdAt: "2024-04-25 01:47:05",
  },
  {
    id: 22,
    screen: "Department",
    title: "Bus Schedule",
    priority: 14,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/transport.png",
    status: 0,
    createdAt: "2024-04-25 01:47:05",
  },
  {
    id: 23,
    screen: "CampusMap",
    title: "Campus Map",
    priority: 12,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/map.png",
    status: 1,
    createdAt: "2024-04-25 01:47:05",
  },
  {
    id: 24,
    screen: "Calendar",
    title: "Calendar",
    priority: 13,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/calander.png",
    status: 1,
    createdAt: "2024-04-25 01:47:05",
  },
  {
    id: 25,
    screen: "Proctor",
    title: "Proctor",
    priority: 6,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/proctor.png",
    status: 1,
    createdAt: "2024-04-25 01:47:05",
  },
  {
    id: 26,
    screen: "Transcript",
    title: "Transcript",
    priority: 10,
    icon: "https://eco.du.ac.bd/assets/images/rokey/appIcons/transcript.png",
    status: 1,
    createdAt: "2024-04-25 12:23:34",
  }
]

//
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
  const state = await NetInfo.fetch();
  const ip = state.details?.ipAddress;
  return {ip, state};
};

export const appInfo = async () => version;

const hasInternetAccess = state => {
  if (!state) {
    return false;
  }

  if (state.isInternetReachable == null) {
    return Boolean(state.isConnected);
  }

  return Boolean(state.isConnected && state.isInternetReachable);
};

let lastKnownOnlineStatus = null;

const handleNetworkChange = state => {
  const isOnline = hasInternetAccess(state);

  if (lastKnownOnlineStatus === isOnline) {
    return;
  }

  lastKnownOnlineStatus = isOnline;

  if (!isOnline) {
    console.warn('No internet connection or internet is not reachable');
  }
};

NetInfo.addEventListener(handleNetworkChange);

// For application installation info, you might need to implement custom methods or find suitable packages
// react-native-device-info provides some relevant methods
export const appInstallInfo = async () => {
  const time = DeviceInfo.getInstallReferrer(); // This may need a custom implementation
  const from = DeviceInfo.getInstallSource(); // This may need a custom implementation

  return {time, from};
};
// #191970
export const color = {
  primary: '#191970', // Softer blue (instead of navy)
  primaryLight: 'rgba(25, 25, 112, 0.55)', // Primary with opacity (proper RGBA format)
  secondary: '#64748b', // Softer gray
  text: '#1e293b', // Softer dark text
  background: '#ffffff', // White background
  secondaryBackground: '#f8fafc', // Very light blue-gray
  accent: '#f59e0b', // Softer orange
  success: '#10b981', // Softer green
  danger: '#ef4444', // Softer red
  warning: '#f59e0b', // Softer yellow/orange
  info: '#06b6d4', // Softer cyan
  light: '#e2e8f0', // Light gray
  lightBlue: '#e0f2fe', // Light blue background
  muted: '#94a3b8', // Muted gray
  gray: '#6b7280', // Standard gray
  gradientBackground: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'], // Softer gradient
};

const FALLBACK_COLOR = color.text || '#000000';

// Defensive color getter to prevent empty string errors
export const getColor = colorName => {
  if (typeof colorName !== 'string' || colorName.trim() === '') {
    return FALLBACK_COLOR;
  }

  const colorValue = color[colorName];

  if (typeof colorValue === 'string' && colorValue.trim() !== '') {
    return colorValue;
  }

  if (colorValue) {
    return colorValue;
  }

  if (Object.prototype.hasOwnProperty.call(color, colorName)) {
    console.warn(`Color '${colorName}' is undefined or empty, falling back to default`);
  }

  return FALLBACK_COLOR;
};

// Safe color object with validation
export const safeColor = new Proxy(color, {
  get(target, prop, receiver) {
    if (typeof prop !== 'string') {
      return Reflect.get(target, prop, receiver);
    }

    const value = Reflect.get(target, prop, receiver);

    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }

    if (value) {
      return value;
    }

    if (Object.prototype.hasOwnProperty.call(target, prop)) {
      console.warn(`Color '${prop}' is undefined or empty, using fallback`);
      return FALLBACK_COLOR;
    }

    return FALLBACK_COLOR;
  }
});

export const defaultUserPhoto = require('../assets/icons/user.png');
// #### TO COMPLE ANDROID BUILD-------------

// #### sudo ./gradlew clean
// ##### sudo ./gradlew assembleDebug

// ####-----------------------------------
// Format ISO date string (e.g., 1999-06-22T18:00:00.000Z) to DD-MM-YYYY
export function formatDate(dateString) {
  if (!dateString || dateString === '' || dateString === 'undefined' || dateString === 'null') {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hourStr = String(hours).padStart(2, '0');

  return `${day}-${month}-${year}, ${hourStr}:${minutes} ${ampm}`;
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
