import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface PaymentHead {
  id: number;
  name: string;
  category: string;
  unit_price: number;
}

export interface Course {
  course_code_title_id: number;
  course_code_title_code: string;
  course_code_title: string;
  course_code_title_credit: number;
  total_marks: number;
}

export interface ExamDetails {
  registered_exam_id: number;
  exam_name: string;
  exam_name_suffix?: string;
  registered_exam_year: string;
  enrollment_last_date: string;
  course_year_id: number;
  student_type?: string;
}

export interface AvailableExam {
  exam: ExamDetails;
  paper_code_titles: Course[];
  student_type: string;
}

export interface EnrollmentOptions {
  degree: {
    degree_name: string;
    degree_started_session_id: number;
    edegree_level_id: number;
    last_enroll_exam_id?: number;
    program_id: number;
    subjects_id: number;
    syllabus_id: number;
  };
  exams: AvailableExam[];
}

export interface PaymentHeadResponse {
  success: boolean;
  data?: PaymentHead[];
  message?: string;
}

export interface EnrollmentOptionsResponse {
  success: boolean;
  data?: EnrollmentOptions;
  message?: string;
}

export async function getPaymentHeads(): Promise<PaymentHeadResponse> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl(API_CONFIG.ENDPOINTS.GET_PAYMENT_HEAD), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch payment heads',
      };
    }
  } catch (error: any) {
    console.error('Error fetching payment heads:', error);
    
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

export async function getEnrollmentOptions(): Promise<EnrollmentOptionsResponse> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl(API_CONFIG.ENDPOINTS.GET_YEAR_SEMESTER_FOR_ENROLLMENT), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.status) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch enrollment options',
      };
    }
  } catch (error: any) {
    console.error('Error fetching enrollment options:', error);
    
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

export function getEnrollmentFee(paymentHeads: PaymentHead[]): number {
  const enrollmentFee = paymentHeads.find(head => head.category === 'ENROLMENT');
  return enrollmentFee?.unit_price || 0;
}

export interface EnrollmentSubmissionResponse {
  registered_student_id: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const submitEnrollment = async (enrollmentData: {
  registered_exam_id: number;
  student_type: string;
  course_code_title_id: number[];
}): Promise<ApiResponse<EnrollmentSubmissionResponse>> => {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.post(
      buildUrl('/student/submit-enrolled-courses'),
      enrollmentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data?.status) {
      return {
        success: true,
        data: {
          registered_student_id: response.data.registered_student_id
        },
        message: response.data.message || 'Successfully enrolled!',
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to submit enrollment',
      };
    }
  } catch (error: any) {
    console.error('Error submitting enrollment:', error);
    
    let errorMsg = 'Network error occurred during enrollment submission';
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
};

export const calculateTotalCost = (courses: any[], enrollmentFee: number): number => {
  return courses.length * enrollmentFee;
};
