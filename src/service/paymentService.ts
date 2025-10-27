import axios from 'axios';
import { API_CONFIG, buildUrl, buildPaymentUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

export interface PaymentDetail {
  application_id: number;
  id: number;
  name: string;
  payment_head_id: number;
  quantity: number;
  total: number;
  unit_price: number;
}

export interface ApplicationDetails {
  admitted_student_name: string;
  admitted_student_reg_no: number | string;
  application_id: number;
  degree_level: string;
  degree_name: string;
  application_type: string;
  payment_details: PaymentDetail[];
}

export interface PaymentInitRequest {
  applicationId: number;
  amount: number;
  type: 'ENROLMENT' | 'FORM_FILLUP' | 'EXAMINATION' | 'TRANSCRIPT' | 'CERTIFICATE';
  studentInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface PaymentInitResponse {
  success: boolean;
  data?: {
    GatewayPageURL?: string;
    sessionkey?: string;
    payment_url?: string;
    redirect_url?: string;
  };
  message?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  data?: {
    status: 'VALID' | 'INVALID' | 'PENDING';
    amount: number;
    currency: string;
    tran_id: string;
    bank_tran_id?: string;
    card_type?: string;
    card_no?: string;
    card_issuer?: string;
    card_brand?: string;
    card_sub_brand?: string;
    card_issuer_country?: string;
    card_issuer_country_code?: string;
    store_amount?: number;
    verify_sign?: string;
    verify_key?: string;
    verify_sign_sha2?: string;
    currency_type?: string;
    currency_amount?: number;
    currency_rate?: number;
    base_fair?: number;
    value_a?: string;
    value_b?: string;
    value_c?: string;
    value_d?: string;
    risk_level?: number;
    risk_title?: string;
  };
  message?: string;
}

// Get application payment details
export const getApplicationPaymentDetails = async (
  applicationId: number,
  type: string
): Promise<{ success: boolean; data?: ApplicationDetails; message?: string }> => {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(
      buildUrl(`/student/application/payment-details/${applicationId}/${type}`),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data?.success || response.data?.data) {
      const resData = response.data.data;
      
      return {
        success: true,
        data: {
          admitted_student_name: resData.admitted_student_name || '',
          admitted_student_reg_no: resData.admitted_student_reg_no || '',
          application_id: Number(applicationId),
          degree_level: resData.degree_level || '',
          degree_name: resData.degree_name || '',
          application_type: resData.application_type || '',
          payment_details: Array.isArray(resData.payment_details) ? resData.payment_details : [],
        },
        message: response.data.message || 'Application details retrieved successfully',
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to get application details',
      };
    }
  } catch (error: any) {
    console.error('Error getting application payment details:', error);
    
    let errorMsg = 'Network error occurred while getting application details';
    if (error?.response?.status === 401) {
      errorMsg = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 404) {
      errorMsg = 'Application not found';
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

// Initialize SSLCommerz payment exactly like web implementation
export const initializeSSLCommerzPayment = async (
  applicationId: number,
  totalAmount: number,
  type: string,
  depositor?: string
): Promise<PaymentInitResponse> => {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    // Helper function to get PSID by type using the academic services mapping
    const getPsidByType = (applicationType: string): string => {
      const academicServices = [
        {
          title: "Enrolment",
          path: "enrolment",
          type: "ENROLMENT",
          psid: "1",
          description: "Enroll in academic courses for the upcoming semester or year",
          note: "You are required to select your preferred courses and complete the enrolment form online.",
          color: "#29B6F6",
          icon: "PersonAdd",
        },
        {
          title: "Exam Form Fill-up",
          path: "exam_form_fill_up",
          type: "FORM_FILLUP",
          psid: "2",
          description: "Complete your examination registration forms online with ease",
          note: "You are required to select the paper codes to complete the exam form fill-up process.",
          color: "#7B61FF",
          icon: "Edit",
        },
        {
          title: "Examination",
          path: "examination",
          type: "EXAMINATION",
          psid: "3",
          description: "Register for examinations and complete required procedures",
          note: "You are required to select your courses and complete the examination registration.",
          color: "#2196F3",
          icon: "Assessment",
        },
        {
          title: "Official Transcripts",
          path: "official_transcripts",
          type: "TRANSCRIPT",
          psid: "DUEXTRNS",
          description: "Request official academic transcripts for universities and employers",
          note: "You are required to upload all academic mark sheets and relevant certificates.",
          color: "#EF5350",
          icon: "Assignment",
        },
        {
          title: "Degree Certificates",
          path: "degree_certificates",
          type: "CERTIFICATE",
          psid: "DUEXCERT",
          description: "Apply for official degree and diploma certificates",
          note: "You are required to upload the admit card of the final examination.",
          color: "#00C853",
          icon: "School",
        },
        {
          title: "Academic Mark-sheets",
          path: "academic_marksheets",
          type: "MARKSHEET",
          psid: "DUEXMRKS",
          description: "Get detailed mark-sheets for all completed courses",
          note: "You are required to upload the admit card of the relevant examination.",
          color: "#FF8F00",
          icon: "ListAlt",
        },
        {
          title: "Document Attestation",
          path: "document_attestation",
          type: "ATTESTATION",
          psid: "DUEXMATT",
          description: "Official attestation services for international document verification",
          note: "You are required to upload a PDF file containing all the documents you wish to have attested.",
          color: "#7E57C2",
          icon: "Verified",
        },
        {
          title: "Digital Record Delivery",
          path: "digital_record_delivery",
          type: "DIGITAL_DELIVERY",
          psid: "DUEXMATT",
          description: "Secure electronic delivery of academic records via email",
          note: "You are required to upload a PDF file containing all the documents you wish to send through email.",
          color: "#00B8D4",
          icon: "Send",
        },
        {
          title: "Information Correction",
          path: "information_correction",
          type: "INFO_CORRECTION",
          psid: "DUEXMINC",
          description: "Update and correct personal information on academic records",
          note: "You may need to upload a notary, registration card, or admission certificate as proof.",
          color: "#EC407A",
          icon: "ManageAccounts",
        },
        {
          title: "Marks Re-evaluation",
          path: "marks_reevaluation",
          type: "RE_EVALUATION",
          psid: "DUEXMREV",
          description: "Request re-evaluation of examination results and grades",
          note: "You are required to upload the examination attendance sheet along with your application.",
          color: "#455A64",
          icon: "Grading",
        },
        {
          title: "Duplicate Admit",
          path: "duplicate_admit",
          type: "DUPLICATE_ADMIT",
          psid: "DUEXMDA",
          description: "Submit a formal request for a duplicate admit card",
          note: "Your duplicate admit card will be issued after verification of your examination records.",
          color: "#5C6BC0",
          icon: "ContentCopy",
        },
      ];
      
      // Normalize the input type for matching
      const normalizedType = applicationType?.toUpperCase().replace('MENT', 'MENT');
      
      const service = academicServices.find(item => 
        item.type.toUpperCase() === normalizedType ||
        item.type.toUpperCase() === `${normalizedType}` ||
        (normalizedType === 'ENROLLMENT' && item.type === 'ENROLMENT')
      );
      
      return service?.psid ?? "1"; // Default to 1 for enrollment
    };

    // Construct success/fail/cancel URLs
    const getCallbackUrl = (status: 'success' | 'fail' | 'cancel') => {
      const baseUrl = 'brittoapp://payment/' + status;
      return `${baseUrl}?applicationId=${applicationId}&type=${type}`;
    };

    // Payload matching web implementation
    const payload = {
      gateway_id: 1, // SSLCommerz gateway ID
      application_id: Number(applicationId),
      total_amount: totalAmount,
      type: type,
      psid: getPsidByType(type),
      depositor: depositor || '',
      success_url: getCallbackUrl('success'),
      fail_url: getCallbackUrl('fail'),
      cancel_url: getCallbackUrl('cancel')
    };

    console.log('Initializing SSLCommerz payment with payload:', payload);
    console.log('PSID for type', type, ':', getPsidByType(type));
    console.log('API URL:', buildPaymentUrl('/management/eco/initiate_payment'));

    // Use the same endpoint as web
    const response = await axios.post(
      buildPaymentUrl('/management/eco/initiate_payment'),
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log("🚀 ~ initializeSSLCommerzPayment ~ response:", response.data);

    const data = response.data;

    // Check for paymentUrl exactly like web app
    if (data.paymentUrl) {
      return {
        success: true,
        data: {
          GatewayPageURL: data.paymentUrl,
          payment_url: data.paymentUrl,
          sessionkey: data.sessionkey,
          redirect_url: data.redirect_url,
        },
        message: data.message || 'Payment initialized successfully',
      };
    } else {
      return {
        success: false,
        message: data.error || data.message || 'Payment initiation failed: No payment URL received',
      };
    }
  } catch (error: any) {
    console.error('Error initializing SSLCommerz payment:', error);
    console.error('Error response:', error?.response?.data);
    console.error('Error status:', error?.response?.status);
    console.error('Error config URL:', error?.config?.url);
    
    let errorMsg = 'Payment initiation failed';
    if (error?.response?.status === 401) {
      errorMsg = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 404) {
      errorMsg = `API endpoint not found. URL: ${error?.config?.url}`;
    } else if (error?.response?.data?.error) {
      errorMsg = `Payment initiation failed: ${error.response.data.error}`;
    } else if (error?.response?.data?.message) {
      errorMsg = `Payment initiation failed: ${error.response.data.message}`;
    } else if (error?.message) {
      errorMsg = `Payment initiation failed: ${error.message}`;
    }

    return {
      success: false,
      message: errorMsg,
    };
  }
};

export const initializePayment = async (paymentData: PaymentInitRequest): Promise<PaymentInitResponse> => {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    // Prepare payload for SSLCommerz payment initialization
    const payload = {
      application_id: paymentData.applicationId,
      amount: paymentData.amount,
      type: paymentData.type,
      currency: 'BDT',
      // Add any additional student info if available
      ...paymentData.studentInfo,
    };

    console.log('Initializing payment with payload:', payload);

    const response = await axios.post(
      buildUrl(`/student/payment/application/${paymentData.applicationId}?type=ENROLMENT`),
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    console.log("🚀 ~ initializePayment ~ response:", response)

    if (response.data?.status || response.data?.success) {
      return {
        success: true,
        data: {
          GatewayPageURL: response.data.GatewayPageURL || response.data.payment_url || response.data.redirect_url,
          sessionkey: response.data.sessionkey,
          payment_url: response.data.payment_url,
          redirect_url: response.data.redirect_url,
        },
        message: response.data.message || 'Payment initialized successfully',
      };
    } else {
      return {
        success: false,
 data: {
          GatewayPageURL: response.data.GatewayPageURL || response.data.payment_url || response.data.redirect_url,
          sessionkey: response.data.sessionkey,
          payment_url: response.data.payment_url,
          redirect_url: response.data.redirect_url,
        },
        message: response.data?.message || 'Failed to initialize payment',
      };
    }
  } catch (error: any) {
    console.error('Error initializing payment:', error);
    
    let errorMsg = 'Network error occurred during payment initialization';
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

export const verifyPayment = async (
  transactionId: string, 
  applicationId: number
): Promise<PaymentVerificationResponse> => {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.post(
      buildPaymentUrl('/student/payment/verify'),
      {
        transaction_id: transactionId,
        application_id: applicationId,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data?.status || response.data?.success) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Payment verified successfully',
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Payment verification failed',
      };
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    
    let errorMsg = 'Network error occurred during payment verification';
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

export const getPaymentStatus = async (applicationId: number): Promise<PaymentVerificationResponse> => {
  try {
    const token = await getAsyncStoreData('token');
    
    if (!token) {
      return {
        success: false,
        message: 'Authentication token not found. Please login again.',
      };
    }

    const response = await axios.get(
      buildPaymentUrl(`/student/payment/status/${applicationId}`),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data?.status || response.data?.success) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Payment status retrieved successfully',
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to get payment status',
      };
    }
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    
    let errorMsg = 'Network error occurred while getting payment status';
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
