import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface TranscriptApplication {
  id: string;
  applicationId: string;
  transcriptType: string;
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
  transcriptVerification: string;
  accountsVerification: string;
  transactionId: string;
  deliveryMethods: any[];
  deliveryStatus: string;
  numOfTranscript: string;
  numOfEnvelope: string;
  degreeLevel: string;
  degreeName: string;
}

export interface TranscriptResponse {
  success: boolean;
  data?: TranscriptApplication[];
  message?: string;
  totalRecords?: number;
  totalPages?: number;
}

export async function getAllTranscripts(page: number = 1, limit: number = 20): Promise<TranscriptResponse> {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(buildUrl(`/student/get-all_application?application_type=TRANSCRIPT&limit=${limit}&page=${page}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      }
    });

    if (response.data?.status && response.data?.applications) {
      // Map the API response to our interface
      const transcripts: TranscriptApplication[] = response.data.applications?.map((item: any) => ({
        id: item.transcript_id || item.application_id,
        applicationId: item.transcript_id,
        transcriptType: item.transcript_type || 'Official Transcript',
        deliveryType: item.delivery_type || 'Regular',
        applicationStatus: item.app_status || 'Pending',
        paymentStatus: item.payment_status === '1' ? 'Paid' : 'Pending',
        amount: item.amount || '0',
        examName: item.exam_name || item.exam_title || 'N/A',
        examYear: item.exam_year || item.exam_held_in || 'N/A',
        passingYear: item.passing_acyr || item.exam_year || 'N/A',
        degreeLevel: item.degree_level || 'N/A',
        degreeName: item.degree_name || 'N/A',
        rollNo: item.roll_no || 'N/A',
        reasonOfApplication: item.reason_of_application || 'Academic Purpose',
        createAt: item.create_at,
        expectedDeliveryDate: item.expected_delivery_date,
        hallVerification: item.hall_verification === '1' ? 'Verified' : 'Pending',
        transcriptVerification: item.transcript_verification === '1' ? 'Verified' : 'Pending',
        accountsVerification: item.accounts_verification === '1' ? 'Verified' : 'Pending',
        transactionId: item.transaction_id || 'N/A',
        deliveryMethods: item.delivery_methods ? JSON.parse(item.delivery_methods) : [],
        deliveryStatus: item.delivery_status || 'Pending',
        numOfTranscript: item.num_of_transcript || '1',
        numOfEnvelope: item.num_of_envelop || '1',
      })) || [];

      return {
        success: true,
        data: transcripts,
        totalRecords: response.data.total_records || transcripts.length,
        totalPages: response.data.total_pages || 1,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch transcript data',
      };
    }
  } catch (error: any) {
    console.error('Error fetching transcripts:', error);
    
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