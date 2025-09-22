import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface ExaminationData {
  id: string;
  examName: string;
  examYear: string;
  examStartDate: string;
  lastDate: string;
  questionLanguage: string;
  hallVerify: boolean;
  admitCardIssue: boolean;
  examinationStatus: string;
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

export interface ExaminationResponse {
  success: boolean;
  data?: ExaminationData[];
  message?: string;
}

export async function getAllExaminations(): Promise<ExaminationResponse> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl('/student/get-all-form-fillup'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.form_fillups) {
      // Map the API response to our interface
      const examinations: ExaminationData[] = response.data.form_fillups?.map((item: any) => ({
        id: item.registered_students_id || item.id,
        examName: item.exam_name,
        examYear: item.registered_exam_year,
        examStartDate: item.exam_start_date || new Date().toISOString(),
        lastDate: item.last_date || new Date().toISOString(),
        questionLanguage: item.question_language || 'English',
        hallVerify: item.hall_verify === '1' || item.hall_verify === 1,
        admitCardIssue: item.admit_card_issue === '1' || item.admit_card_issue === 1,
        examinationStatus: item.examination_status || 'Active',
        paymentStatus: item.payment_details && item.payment_details.length > 0 ? 'YES' : 'NO',
        examRoll: item.registered_students_exam_roll,
        classRoll: item.class_roll,
        studentType: item.registered_students_type || 'Regular',
        departmentVerify: item.registered_students_college_verify === '1' || item.registered_students_college_verify === 1,
        courses: item.courses?.map((course: any) => ({
          courseCode: course.course_code,
          courseTitle: course.course_title,
          courseCredit: course.course_credit?.toString() || '0',
        })) || []
      })) || [];

      return {
        success: true,
        data: examinations,
      };

      return {
        success: true,
        data: examinations,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch examination data',
      };
    }
  } catch (error: any) {
    console.error('Error fetching examinations:', error);
    
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
