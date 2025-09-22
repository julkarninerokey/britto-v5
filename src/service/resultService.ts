import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface ResultCourse {
  courseCode: string;
  courseTitle: string;
  courseCredit: number;
  gradePoint: string;
  letterGrade: string;
  enrolledCourseId: number;
}

export interface ResultData {
  id: string;
  examName: string;
  examYear: string;
  subject: string;
  enrollmentDateTime: string;
  gpa: string;
  cgpa: string;
  registeredStudentsType: string;
  courses: ResultCourse[];
}

export interface ResultResponse {
  success: boolean;
  data?: ResultData[];
  message?: string;
  totalRecords?: number;
  totalPages?: number;
}

export async function getAllResults(): Promise<ResultResponse> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl('/student/get-all-exams-for-result'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });


    if (response.data?.status && response.data?.exams) {
      // Map the API response to our interface
      const results: ResultData[] = response.data.exams?.map((item: any) => ({
        id: item.registered_students_id || item.registered_exam_id,
        examName: item.exam_name,
        examYear: item.registered_exam_year,
        subject: item.subject,
        enrollmentDateTime: item.enrollment_date_time,
        gpa: item.gpa || '0.00',
        cgpa: item.cgpa || '0.00',
        registeredStudentsType: item.registered_students_type === '0' ? 'Regular' : 'Irregular',
        courses: item.courses?.map((course: any) => ({
          courseCode: course.course_code,
          courseTitle: course.course_title,
          courseCredit: course.course_credit,
          gradePoint: course.gp || '0',
          letterGrade: course.lg || 'F',
          enrolledCourseId: course.enrolled_course_id,
        })) || []
      })) || [];

      return {
        success: true,
        data: results,
        totalRecords: response.data.total_records || results.length,
        totalPages: response.data.total_pages || 1,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch result data',
      };
    }
  } catch (error: any) {
    console.error('Error fetching results:', error);
    
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
