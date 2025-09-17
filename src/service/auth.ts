import axios from 'axios';
import { getAsyncStoreData, setAsyncStoreData } from '../utils/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildUrl } from '../config/api';

export interface StudentDetails {
  name: string;
  banglaName: string;
  regNo: string;
  photo: string;
  hall: string;
  session: string;
  contact: string;
  email: string;
  department?: string;
  degree?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: string;
  user?: StudentDetails;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    // Using the new API structure you provided
    const loginResponse = await axios.post(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      registration_number: email,
      password: password,
    }, {
      headers: {
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (!loginResponse.data?.status || !loginResponse.data?.token) {
      return {
        success: false,
        message: loginResponse.data?.message || 'Login failed',
      };
    }

    const token = loginResponse.data.token;
    await setAsyncStoreData('session', token);

    try {
      // Fetch student details
      const studentResponse = await axios.get(buildUrl(API_CONFIG.ENDPOINTS.STUDENT_ME), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        }
      });
      console.log("🚀 ~ login ~ studentResponse:", studentResponse)

      if (studentResponse.data?.status) {
        const student = studentResponse.data.student;
        const degreeDetails = studentResponse.data.degree_details[0];
        
        const studentData: StudentDetails = {
          name: student.admitted_student_name,
          banglaName: student.student_bangla_name,
          regNo: student.admitted_student_reg_no,
          photo: student.photo,
          hall: student.hall_title_en,
          session: student.session_name,
          contact: student.admitted_student_contact_no,
          email: student.admitted_student_email,
          department: degreeDetails?.subjects_title_en,
          degree: degreeDetails?.degree_name
        };

        // Store in the new format
        await AsyncStorage.setItem('studentDetails', JSON.stringify(studentData));
        
        // Also store in individual keys for backward compatibility
        await AsyncStorage.setItem('name', student.admitted_student_name || '');
        await AsyncStorage.setItem('session', student.session_name || '');
        await AsyncStorage.setItem('hall', student.hall_title_en || '');
        await AsyncStorage.setItem('photo', student.photo || '');
        await AsyncStorage.setItem('reg', student.admitted_student_reg_no || '');
        
        return {
          success: true,
          session: token,
          user: studentData
        };
      }
    } catch (studentError) {
      console.error('Error fetching student details:', studentError);
    }

    // Return basic success if student details fetch fails
    return {
      success: true,
      session: token
    };
  } catch (error: any) {
    let errorMsg = 'Network error';
    if (error?.response?.status === 500) {
      errorMsg = 'Server error, please try again later.';
    } else if (error?.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error?.message) {
      errorMsg = error.message;
    }
    return {
      success: false,
      message: errorMsg,
    };
  }
}

export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    // Clear all auth-related data
    await AsyncStorage.multiRemove([
      'session',
      'studentDetails',
      'reg',
      'token',
      'name',
      'hall',
      'photo'
    ]);
    
    // Add a small delay to ensure storage is cleared
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { 
      success: false, 
      message: 'Failed to logout. Please try again.' 
    };
  }
}

export async function getSession() {
  return await getAsyncStoreData('session');
}

export async function getUser(): Promise<StudentDetails | null> {
  try {
    const userStr = await AsyncStorage.getItem('studentDetails');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}
