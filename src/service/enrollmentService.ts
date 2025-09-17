import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface EnrollmentData {
  id: string;
  examName: string;
  examYear: string;
  examStartDate: string;
  lastDate: string;
  questionLanguage: string;
  hallVerify: boolean;
  admitCardIssue: boolean;
  enrollmentStatus: string;
  paymentStatus: string;
  examRoll?: string;
  classRoll?: string;
  studentType: string;
  departmentVerify: boolean;
  courses?: Course[];
}

export interface Course {
  courseCode: string;
  courseTitle: string;
  courseCredit: string;
}

export interface EnrollmentResponse {
  success: boolean;
  data?: EnrollmentData[];
  message?: string;
}

export async function getAllEnrollments(): Promise<EnrollmentResponse> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl(API_CONFIG.ENDPOINTS.GET_ALL_ENROLLMENTS), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.status) {
      // Map the API response to our interface
      const enrollments: EnrollmentData[] = response.data.enrollments?.map((item: any) => ({
        id: item.registered_students_id || item.id || item.exam_id,
        examName: item.exam_name || item.EXAM_NAME,
        examYear: item.registered_exam_year || item.exam_year || item.REGISTERED_EXAM_YEAR,
        examStartDate: item.exam_start_date || item.EXAM_START_DATE || new Date().toISOString(),
        lastDate: item.last_date || item.LAST_DATE || new Date().toISOString(),
        questionLanguage: item.question_language || 'English',
        hallVerify: item.hall_verify === 1 || item.HALL_VERIFY === 1 || item.hall_verify === 'YES',
        admitCardIssue: item.admit_card_issue === 1 || item.ADMIT_CARD_ISSUE === 1 || item.admit_card_issue === 'YES',
        enrollmentStatus: item.enrollment_status || 'Active',
        paymentStatus: item.enrolment_payment_status === 'YES' || item.payment_status === 1 ? 'Paid' : 'Pending',
        examRoll: item.exam_roll || item.REGISTERED_STUDENTS_EXAM_ROLL,
        classRoll: item.class_roll || item.CLASS_ROLL,
        studentType: item.registered_students_type || item.student_type || 'Regular',
        departmentVerify: item.enrolment_department_verification === 'YES' || item.department_verify === 1 || item.REGISTERED_STUDENTS_COLLEGE_VERIFY === 1,
        courses: item.enrolled_courses?.map((course: any) => ({
          courseCode: course.course_code || course.COURSE_CODE_TITLE_CODE,
          courseTitle: course.course_title || course.COURSE_CODE_TITLE,
          courseCredit: course.course_credit?.toString() || course.COURSE_CODE_TITLE_CREDIT?.toString() || '0',
        })) || []
      })) || [];

      return {
        success: true,
        data: enrollments,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch enrollment data',
      };
    }
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    
    let errorMsg = 'Network error occurred';
    if (error?.response?.status === 401) {
      errorMsg = 'Authentication failed. Please login again.';
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
