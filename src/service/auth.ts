import axios from 'axios';
import { getAsyncStoreData, setAsyncStoreData } from '../utils/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, OTP_API, buildUrl } from '../config/api';

export interface CompletedDegree {
  id: string;
  degreeName: string;
  degreeStatus: string;
  examRoll: string;
  examYear: string;
  finalResult: string;
  resultPublicationDate: string;
  programsName: string;
  subjectsTitle: string;
  resultVerified: string;
  resultVerifiedAt: string;
  allResultAvailable: string;
  certificateDelivered?: string;
  marksheetDelivered?: string;
  transcriptDelivered?: string;
  accountsClearance?: string;
  hallClearance?: string;
  libraryClearance?: string;
}

export interface StudentDetails {
  name: string;
  banglaName: string;
  regNo: string;
  photo: string;
  hall: string;
  hallBangla: string;
  session: string;
  contact: string;
  email: string;
  department?: string;
  departmentBangla?: string;
  degree?: string;
  fathersName?: string;
  mothersName?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  presentAddress?: string;
  permanentAddress?: string;
  examRoll?: string;
  finalResult?: string;
  resultPublicationDate?: string;
  // Additional fields from the full API response
  gender?: string;
  guardianName?: string;
  casteSect?: string;
  emailVerified?: string;
  admittedStudentId?: string;
  sessionId?: string;
  subjectsId?: string;
  institutionTypeId?: string;
  admittedStudentStatus?: string;
  presentHouseNo?: string;
  presentHouseRoad?: string;
  presentPoliceStation?: string;
  presentUpaZilla?: string;
  permanentUpaZilla?: string;
  permanentPostCode?: string;
  punishmentStatus?: string;
  // Completed degrees array
  completedDegrees?: CompletedDegree[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: string;
  user?: StudentDetails;
}

interface BasicResponse {
  success: boolean;
  message?: string;
}

function deriveErrorMessage(error: any, fallback: string = 'Network error'): string {
  if (error?.response?.status === 500) {
    return 'Server error, please try again later.';
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
}

async function persistAuthenticatedUser(token: string): Promise<AuthResponse> {
  await setAsyncStoreData('token', token);

  try {
    // Fetch student details
    const studentResponse = await axios.get(buildUrl(API_CONFIG.ENDPOINTS.STUDENT_ME), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (studentResponse.data?.status) {
      const student = studentResponse.data.student;
      const degreeDetails = studentResponse.data.degree_details[0];
      const completedDegrees = studentResponse.data.completed_degrees || [];
      
      // Map completed degrees
      const mappedCompletedDegrees: CompletedDegree[] = completedDegrees.map((degree: any) => ({
        id: degree.id,
        degreeName: degree.degree_name,
        degreeStatus: degree.degree_status,
        examRoll: degree.exam_roll,
        examYear: degree.exam_year,
        finalResult: degree.final_result,
        resultPublicationDate: degree.result_publication_date,
        programsName: degree.programs_name,
        subjectsTitle: degree.subjects_title,
        resultVerified: degree.result_verified,
        resultVerifiedAt: degree.result_verified_at,
        allResultAvailable: degree.all_result_available,
        certificateDelivered: degree.certificate_delivered,
        marksheetDelivered: degree.marksheet_delivered,
        transcriptDelivered: degree.transcript_delivered,
        accountsClearance: degree.accounts_clearance,
        hallClearance: degree.hall_clearance,
        libraryClearance: degree.library_clearance,
      }));
      
      const studentData: StudentDetails = {
        name: student.admitted_student_name,
        banglaName: student.student_bangla_name,
        regNo: student.admitted_student_reg_no,
        photo: student.photo,
        hall: student.hall_title_en,
        hallBangla: student.hall_title,
        session: student.session_name,
        contact: student.admitted_student_contact_no,
        email: student.admitted_student_email,
        department: student.subjects_title || degreeDetails?.subjects_title_en,
        departmentBangla: completedDegrees[0]?.subjects_title || 'N/A',
        degree: degreeDetails?.degree_name || completedDegrees[0]?.degree_name,
        fathersName: student.admitted_student_fathers_n,
        mothersName: student.admitted_student_mothers_n,
        dateOfBirth: student.admitted_student_dob,
        bloodGroup: student.blood_group,
        religion: student.religion,
        nationality: student.nationality,
        presentAddress: `${student.present_address || ''}, ${student.present_post_office || ''}, ${student.present_district || ''}`.replace(/^,\s*|,\s*$/g, ''),
        permanentAddress: `${student.permanent_address || ''}, ${student.permanent_post_office || ''}, ${student.permanent_district || ''}`.replace(/^,\s*|,\s*$/g, ''),
        examRoll: completedDegrees[0]?.exam_roll || degreeDetails?.exam_roll,
        finalResult: completedDegrees[0]?.final_result || degreeDetails?.final_result,
        resultPublicationDate: completedDegrees[0]?.result_publication_date || degreeDetails?.result_publication_date,
        // Additional fields
        gender: student.admitted_student_gender,
        guardianName: student.gurdian_name,
        casteSect: student.caste_sect,
        emailVerified: student.email_verified,
        admittedStudentId: student.admitted_student_id,
        sessionId: student.session_id,
        subjectsId: student.subjects_id,
        institutionTypeId: student.institution_type_id,
        admittedStudentStatus: student.admitted_student_status,
        presentHouseNo: student.present_house_no,
        presentHouseRoad: student.present_house_road,
        presentPoliceStation: student.present_police_station,
        presentUpaZilla: student.present_upa_zilla,
        permanentUpaZilla: student.permanent_upa_zilla,
        permanentPostCode: student.permanent_post_code,
        punishmentStatus: student.punishment_status,
        completedDegrees: mappedCompletedDegrees
      };

      // Store in the new format
      await AsyncStorage.setItem('studentDetails', JSON.stringify(studentData));
      
      // Also store in individual keys for backward compatibility
      await AsyncStorage.setItem('name', student.admitted_student_name || '');
      await AsyncStorage.setItem('session', student.session_name || '');
      await AsyncStorage.setItem('hall', student.hall_title_en || '');
      await AsyncStorage.setItem('photo', student.photo || '');
      await AsyncStorage.setItem('reg', student.admitted_student_reg_no || '');
      await AsyncStorage.setItem('department', student.subjects_title || '');
      await AsyncStorage.setItem('email', student.admitted_student_email || '');
      await AsyncStorage.setItem('contact', student.admitted_student_contact_no || '');
      await AsyncStorage.setItem('bloodGroup', student.blood_group || '');
      await AsyncStorage.setItem('fathersName', student.admitted_student_fathers_n || '');
      await AsyncStorage.setItem('mothersName', student.admitted_student_mothers_n || '');
      await AsyncStorage.setItem('dateOfBirth', student.admitted_student_dob || '');
      await AsyncStorage.setItem('religion', student.religion || '');
      await AsyncStorage.setItem('nationality', student.nationality || '');
      
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

    return await persistAuthenticatedUser(loginResponse.data.token);
  } catch (error: any) {
    return {
      success: false,
      message: deriveErrorMessage(error),
    };
  }
}

export async function sendLoginOtp(email: string): Promise<BasicResponse> {
  try {
    const response = await axios.post(OTP_API.sendOtp, { email }, {
      headers: {
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.status) {
      return {
        success: true,
        message: response.data?.message || 'OTP sent to your email address.',
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to send OTP. Please try again.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: deriveErrorMessage(error, 'Unable to send OTP. Please try again.'),
    };
  }
}

export async function verifyLoginOtp(email: string, otp: string): Promise<AuthResponse> {
  try {

    const response = await axios.post(OTP_API.verifyOtp, { email, otp, user_type: "STUDENT", validation_for: "PASSWORD_RECOVERY" }, {
      headers: {
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    console.log('OTP verification response:', response.data);

    if (!response.data?.status || !response.data?.token) {
      return {
        success: false,
        message: response.data?.message || 'Invalid OTP. Please try again.',
      };
    }

    return await persistAuthenticatedUser(response.data.token);
  } catch (error: any) {
    return {
      success: false,
      message: deriveErrorMessage(error, 'Failed to verify OTP. Please try again.'),
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
