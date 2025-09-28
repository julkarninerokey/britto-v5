import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface CompletedDegree {
  id: string;
  degreeName: string;
  degreeId: string;
  degreeStatus: string;
  examRoll: string;
  examYear: string;
  finalResult: string;
  resultPublicationDate: string;
  resultVerified: string;
  subjectsId: string;
  subjectsTitle: string;
  programsId: string;
  programsName: string;
}

export interface Department {
  subjectsId: string;
  subjectsTitle: string;
  subjectsTitleEn: string;
}

export interface Program {
  programsId: number;
  programsName: string;
}

export interface Hall {
  id: number;
  hallTitle: string;
  hallTitleEn: string;
}

export async function getCompletedDegrees(): Promise<{ success: boolean; data?: CompletedDegree[]; message?: string }> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl('/student/get-completed-degrees'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.status && response.data?.degrees) {
      const degrees: CompletedDegree[] = response.data.degrees.map((item: any) => ({
        id: item.id,
        degreeName: item.degree_name,
        degreeId: item.degree_id,
        degreeStatus: item.degree_status,
        examRoll: item.exam_roll,
        examYear: item.exam_year,
        finalResult: item.final_result,
        resultPublicationDate: item.result_publication_date,
        resultVerified: item.result_verified,
        subjectsId: item.subjects_id,
        subjectsTitle: item.subjects_title,
        programsId: item.programs_id,
        programsName: item.programs_name,
      }));

      return { success: true, data: degrees };
    } else {
      return { success: false, message: 'No completed degrees found' };
    }
  } catch (error: any) {
    console.error('Error fetching completed degrees:', buildUrl('/student/get-completed-degrees'));
    return { success: false, message: error.message + 'Failed to fetch degrees' };
  }
}

export async function getAllDepartments(): Promise<{ success: boolean; data?: Department[]; message?: string }> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl('/student/get-all-department-or_subject'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.status && response.data?.subject) {
      const departments: Department[] = response.data.subject.map((item: any) => ({
        subjectsId: item.subjects_id,
        subjectsTitle: item.subjects_title,
        subjectsTitleEn: item.subjects_title_en,
      }));

      return { success: true, data: departments };
    } else {
      return { success: false, message: 'No departments found' };
    }
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return { success: false, message: error.message || 'Failed to fetch departments' };
  }
}

export async function getPrograms(): Promise<{ success: boolean; data?: Program[]; message?: string }> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl('/student/get-program'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.success && response.data?.data) {
      const programs: Program[] = response.data.data.map((item: any) => ({
        programsId: item.programs_id,
        programsName: item.programs_name,
      }));

      return { success: true, data: programs };
    } else {
      return { success: false, message: 'No programs found' };
    }
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return { success: false, message: error.message || 'Failed to fetch programs' };
  }
}

export async function getAllHalls(): Promise<{ success: boolean; data?: Hall[]; message?: string }> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }
    const endpoints = ['/get-all-halls', '/get-all-hall'];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(buildUrl(endpoint), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
          }
        });

        const payload = response.data?.data || response.data?.halls || response.data?.hallList;

        if (response.data?.status && Array.isArray(payload)) {
          const halls: Hall[] = (payload as any[])
            .map<Hall | null>((item: any) => {
              const id = item.id ?? item.hall_id;
              const hallTitle = item.hall_title ?? item.hallTitle ?? item.name;
              const hallTitleEn = item.hall_title_en ?? item.hallTitleEn ?? item.name_en ?? hallTitle;

              if (id == null || !hallTitle) {
                return null;
              }

              return {
                id,
                hallTitle,
                hallTitleEn,
              };
            })
            .filter((hall): hall is Hall => hall !== null);

          if (halls.length) {
            return { success: true, data: halls };
          }
        }

        if (response.data?.status === false && response.data?.message) {
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          continue;
        }
        throw error;
      }
    }

    return { success: false, message: 'No halls found' };
  } catch (error: any) {
    console.error('Error fetching halls:', error);
    return { success: false, message: error.message || 'Failed to fetch halls' };
  }
}

export async function submitCertificateApplication(formData: any): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.post(
      buildUrl('/student/submit-certificate-application'),
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        }
      }
    );

    if (response.data?.status) {
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Application submitted successfully!'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to submit application'
      };
    }
  } catch (error: any) {
    console.error('Error submitting certificate application:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to submit application'
    };
  }
}
