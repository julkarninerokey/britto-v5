import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface CertificateApplication {
  id: string;
  applicationId: string;
  certificateType: string;
  deliveryType: string;
  applicationStatus: string;
  paymentStatus: string;
  amount: string;
  examName: string;
  examYear: string;
  passingYear: string;
  rollNo: string;
  reasonOfApplication: string;
  createAt: string;
  expectedDeliveryDate: string;
  hallVerification: string;
  certificateVerification: string;
  accountsVerification: string;
  transactionId: string;
  deliveryMethods: any[];
  deliveryStatus: string;
}

export interface CertificateResponse {
  success: boolean;
  data?: CertificateApplication[];
  message?: string;
  totalRecords?: number;
  totalPages?: number;
}

export async function getAllCertificates(page: number = 1, limit: number = 20): Promise<CertificateResponse> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl(`/student/get-all_application?application_type=CERTIFICATE&limit=${limit}&page=${page}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });


    if (response.data?.status && response.data?.applications) {
      // Map the API response to our interface
      const certificates: CertificateApplication[] = response.data.applications?.map((item: any) => ({
        id: item.transcript_id || item.application_id,
        applicationId: item.transcript_id,
        certificateType: item.certificate_type || 'N/A',
        deliveryType: item.delivery_type || 'Regular',
        applicationStatus: item.app_status || 'Pending',
        paymentStatus: item.payment_status === '1' ? 'Paid' : 'Pending',
        amount: item.amount || '0',
        examName: item.exam_name || 'N/A',
        examYear: item.exam_year || 'N/A',
        passingYear: item.passing_acyr || item.exam_year || 'N/A',
        degreeLevel: item.degree_level || 'N/A',
        rollNo: item.roll_no || 'N/A',
        reasonOfApplication: item.reason_of_application || 'N/A',
        createAt: item.create_at,
        expectedDeliveryDate: item.expected_delivery_date,
        hallVerification: item.hall_verification === '1' ? 'Verified' : 'Pending',
        certificateVerification: item.certificate_verification === '1' ? 'Verified' : 'Pending',
        accountsVerification: item.accounts_verification === '1' ? 'Verified' : 'Pending',
        transactionId: item.transaction_id || 'N/A',
        deliveryMethods: item.delivery_methods ? JSON.parse(item.delivery_methods) : [],
        deliveryStatus: item.delivery_status || 'Pending',
      })) || [];

      return {
        success: true,
        data: certificates,
        totalRecords: response.data.total_records || certificates.length,
        totalPages: response.data.total_pages || 1,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch certificate data',
      };
    }
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    
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
