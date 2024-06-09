import axios from 'axios';
import {appInfo, deviceInfo, netInfo, saveLogin, toast} from './utils';
import DeviceInfo from 'react-native-device-info';
import {getLocales} from 'react-native-localize';

const BASE_URL = 'https://britto.result.du.ac.bd/app/';

export const getCertificate = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getAllCertificateInfo`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      toast(
        'danger',
        'Invalid Registration Number',
        'Logout & Login Again to Continue.',
      );
      throw error;
    }
  }
};

export const getMarksheet = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getAllMarksheetInfo`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      toast(
        'danger',
        'Invalid Registration Number',
        'Logout & Login Again to Continue.',
      );
      throw error;
    }
  }
};

export const getResult = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getAllResult`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      toast(
        'danger',
        'Invalid Registration Number',
        'Logout & Login Again to Continue.',
      );
      throw error;
    }
  }
};

export const getExam = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getFomFillupData`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      toast(
        'danger',
        'Invalid Registration Number',
        'Logout & Login Again to Continue.',
      );
      throw error;
    }
  }
};

export const getNotice = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getAllNotices`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      toast(
        'danger',
        'Invalid Registration Number',
        'Logout & Login Again to Continue.',
      );
      throw error;
    }
  }
};

export const getSyllabus = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getSyllabus`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      toast(
        'danger',
        'Invalid Registration Number',
        'Logout & Login Again to Continue.',
      );
      throw error;
    }
  }
};

export const deptData = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getDeptData`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }
};

export const hallData = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
    return false;
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getHallData`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }
};

export const profileData = async reg => {
  if (!reg || reg.length !== 10) {
    toast(
      'danger',
      'Invalid Registration Number',
      'Logout & Login Again to Continue.',
    );
  } else {
    const data = {
      reg: reg,
    };

    try {
      const response = await axios.get(`${BASE_URL}/getProfileData`, {
        params: data,
      });

      if (response?.data?.status === 200) {
        return response?.data;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }
};

export const login = async (reg, pass) => {
  if (!reg || reg.length !== 10) {
    toast('danger', 'Invalid Registration Number');
  } else if (!pass || pass.length < 6) {
    toast('danger', 'Invalid Password');
  } else {
    const net = await netInfo();
    const Device = deviceInfo();
    const osVersion = Device.systemVersion || 0;
    const deviceName = `${DeviceInfo.getBrand()} - ${DeviceInfo.getModel()}`;
    const statusBarHeight = DeviceInfo.hasNotch() ? 30 : 20; // Assuming 30 if there's a notch, otherwise 20
    const sessionId = DeviceInfo.getUniqueId(); // Using unique ID as session ID
    const lang = getLocales();
    const appVersion = (await appInfo()) || 1;

    const data = {
      reg: reg,
      pass: pass,
      netInfo: JSON.stringify(net),
      deviceName: deviceName,
      osVersion: osVersion,
      lang: JSON.stringify(lang),
      statusBarHeight: statusBarHeight,
      sessionId: sessionId,
      ipAddress: net?.ip,
      device: JSON.stringify(Device),
      version: appVersion,
    };

    try {
      const response = await axios.get(`${BASE_URL}/checkForLogin`, {
        params: data,
      });

      if (response.data.status === 300) {
        // handle specific status code
      } else if (response?.data?.status === 200) {
        const save = await saveLogin(response.data, reg);
        return response?.data?.status;
      } else if (response.data.status === 201) {
        // handle specific status code
      } else if (response.data.status === 303 || response.data.status === 304) {
        console.error(response.data.message);
      } else {
        toast('danger', 'Something Went Wrong, Please Try Again Later.(1)');
        const errorData = [
          'Login',
          'Unknown Status Code sent For login',
          [reg, pass, appVersion],
        ];
        console.log('🚀 ~ handleLogin ~ errorData:', errorData);
        // errorReport(errorData);
      }
    } catch (error) {
      toast('danger', 'Invalid Password');
      throw error;
    }
  }
  //return false;
};

export const statusCheck = async () => {
  try {
    const device = deviceInfo();
    const network = await netInfo();
    const app = await appInfo();

    if (!network?.state?.isInternetReachable) {
      return {
        status: false,
        title: 'No Internet',
        subtitle: 'Please Check Your Internet Connection and Try Again.',
      };
    } else {
      const response = await axios.post(
        `${BASE_URL}/statusCheck?version=${app}`,
      );
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching information:', error);
    throw error; // Re-throw the error to propagate it to the caller
  }
};
