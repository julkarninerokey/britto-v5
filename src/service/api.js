import axios from 'axios';
import { appInfo, deviceInfo, netInfo, saveLogin, toast} from './utils';
import DeviceInfo from 'react-native-device-info';
import {getLocales} from 'react-native-localize';

// export const API_URL = 'http://172.20.10.8:4100/api/britto';
export const API_URL = 'https://resapi.eco.du.ac.bd/api/britto';
export const API_SECRET_TOKEN = '8f3c1e2d3a4b5c6d7e8f9a0b1c2d3e4f';

export const statusCheck = async () => {
  try {
    const app = await appInfo(); 

    const response = await axios.post(
      API_URL,
      {action: 'statusCheck', version: app},
      {headers: {'x-api-token': API_SECRET_TOKEN}},
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching information:', error);
    throw error;
  }
};

async function fetchByReg(action, reg) {
  if (!isConnected || isConnected?.status !== '1') {
    toast('danger', isConnected?.title, isConnected?.subtitle);
    return null;
  }
  if (!reg || reg.length !== 10) {
    toast( 
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  }
  try {
    const response = await axios.post(
      API_URL,
      {action, reg:2017417693},
      {headers: {'x-api-token': API_SECRET_TOKEN}},
    );

    console.log("🚀 ------------------------------------------------🚀")
    console.log("🚀 ~ api.js:43 ~ fetchByReg ~ response:", response)
    console.log("🚀 ------------------------------------------------🚀")

    if (response?.data?.status === 200 || response?.data?.status === 201) {
      return response.data;
    } else {
      return false;
    }
  } catch (error) {
      toast('danger', 'Something Went Wrong, Please Try Again Later.');
      return false;
    throw error;
  }
}

// All reg-based actions
export const getTranscript = reg => fetchByReg('getTranscript', reg);
export const getCertificate = reg => fetchByReg('getCertificate', reg);
export const getMarksheet = reg => fetchByReg('getMarksheet', reg);
export const getResult = reg => fetchByReg('getResult', reg);
export const getExam = reg => fetchByReg('getExam', reg);
export const getFormFillup = reg => fetchByReg('getFormFillup', reg);
export const getNotice = reg => fetchByReg('getNotice', reg);
export const getSyllabus = reg => fetchByReg('getSyllabus', reg);
export const deptData = reg => fetchByReg('deptData', reg);
export const hallData = reg => fetchByReg('hallData', reg);
export const profileData = reg => fetchByReg('profileData', reg);

// Login
export const login = async (reg, pass) => {
  const isConnected = await statusCheck();
  if (!isConnected || isConnected?.status !== '1') {
    toast('danger', isConnected?.title || 'Network Error', isConnected?.subtitle || 'Unable to connect.');
    return null;
  }
  if (!reg || reg.length !== 10) {
    toast('danger', 'Invalid Registration Number');
    return false;
  } else if (!pass || pass.length < 6) {
    toast('danger', 'Invalid Password');
    return false;
  } else {
    try {
      const net = await netInfo();
      const Device = deviceInfo();
      const osVersion = Device.systemVersion || 0;
      const deviceName = `${DeviceInfo.getBrand()} - ${DeviceInfo.getModel()}`;
      const statusBarHeight = DeviceInfo.hasNotch() ? 30 : 20;
      const sessionId = DeviceInfo.getUniqueId();
      const lang = getLocales();
      const appVersion = (await appInfo()) || 1;

      const data = {
        action: 'login',
        reg,
        pass,
        netInfo: JSON.stringify(net),
        deviceName,
        osVersion,
        lang: JSON.stringify(lang),
        statusBarHeight,
        sessionId,
        ipAddress: net?.ip,
        device: JSON.stringify(Device),
        version: appVersion,
      };

      const response = await axios.post(API_URL, data, {
        headers: {'x-api-token': API_SECRET_TOKEN},
      });
      console.log("🚀 ~ login ~ response:", response);

      if (response.data.status === 200) {
        await saveLogin(response.data, reg);
        return 200;
      } else if (response.data.status === 300) {
        toast('danger', response.data.message || 'Account issue.');
        return 300;
      } else if (response.data.status === 201) {
        toast('danger', response.data.message || 'Account not verified.');
        return 201;
      } else if (response.data.status === 303 || response.data.status === 304) {
        toast('danger', response.data.message || 'Account locked or other issue.');
        return response.data.status;
      } else {
        toast('danger', 'Something Went Wrong, Please Try Again Later.(1)');
        const errorData = [
          'Login',
          'Unknown Status Code sent For login',
          [reg, pass, appVersion],
        ];
        console.log('🚀 ~ handleLogin ~ errorData:', errorData);
        // errorReport(errorData);
        return false;
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast('danger', 'Something Went Wrong, Please Try Again Later.');
      return false;
    }
  }
};

// Initial check
