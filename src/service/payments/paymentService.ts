import { getAsyncStoreData } from '../../utils/async-storage';
import apiService from '../apiService';
import { ApplicationDetails, PaymentInitResponse, PaymentVerificationResponse } from './types';
import { getPaymentHeads } from '../newEnrollmentService';

export class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private getPsidByType(applicationType: string): string {
    const academicServices = [
      { type: "ENROLMENT", psid: "1" },
      { type: "FORM_FILLUP", psid: "2" },
      { type: "EXAMINATION", psid: "3" },
      { type: "TRANSCRIPT", psid: "DUEXTRNS" },
      { type: "CERTIFICATE", psid: "DUEXCERT" },
      { type: "MARKSHEET", psid: "DUEXMRKS" },
      { type: "ATTESTATION", psid: "DUEXMATT" },
      { type: "DIGITAL_DELIVERY", psid: "DUEXMATT" },
      { type: "INFO_CORRECTION", psid: "DUEXMINC" },
      { type: "RE_EVALUATION", psid: "DUEXMREV" },
      { type: "DUPLICATE_ADMIT", psid: "DUEXMDA" },
    ];
    
    const normalizedType = applicationType?.toUpperCase().replace('MENT', 'MENT');
    const service = academicServices.find(item => 
      item.type === normalizedType ||
      (normalizedType === 'ENROLLMENT' && item.type === 'ENROLMENT')
    );
    
    return service?.psid ?? "1";
  }

  private getCallbackUrl(applicationId: number, type: string, status: 'success' | 'fail' | 'cancel'): string {
    return `brittoapp://payment/${status}?applicationId=${applicationId}&type=${type}`;
  }

  public async getApplicationPaymentDetails(applicationId: number, type: string): Promise<ApplicationDetails | null> {
    try {
      const response = await apiService.getClient(
        `/student/application/payment-details/${applicationId}/${type}`
      );

      if (response.success && response.data) {
        const raw = response.data as any;
        const data = raw?.data ?? raw; // support both wrapped and direct payloads
        return {
          admitted_student_name: data?.admitted_student_name || '',
          admitted_student_reg_no: data?.admitted_student_reg_no || '',
          application_id: Number(applicationId),
          degree_level: data?.degree_level || '',
          degree_name: data?.degree_name || '',
          application_type: data?.application_type || type,
          payment_details: Array.isArray(data?.payment_details) ? data.payment_details : [],
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting application payment details:', error);
      throw error;
    }
  }

  public async initializePayment(
    applicationId: number,
    totalAmount: number,
    type: string,
    depositor?: string,
    gatewayId?: number
  ): Promise<PaymentInitResponse> {
    try {
      // Get application details for payment heads
      const appDetails = await this.getApplicationPaymentDetails(applicationId, type);

      // Try to build heads from application details first
      let headsPayload = appDetails?.payment_details?.length
        ? appDetails.payment_details.map(item => ({
            head_id: Number(item.payment_head_id),
            count: Number(item.quantity || 1)
          }))
        : [];

      // Fallback: fetch global payment heads and select by category/name
      if (!headsPayload.length) {
        try {
          const headsRes = await getPaymentHeads();
          const heads = headsRes.success ? headsRes.data || [] : [];
          const normalizedType = (type || '').toUpperCase();
          const match = heads.find((h: any) =>
            h?.category?.toUpperCase() === normalizedType ||
            (h?.name || '').toLowerCase().includes(normalizedType.toLowerCase())
          );
          if (match?.id) {
            headsPayload = [{ head_id: Number(match.id), count: 1 }];
          }
        } catch (e) {
          // Ignore; will error below if still empty
        }
      }

      if (!headsPayload.length) {
        throw new Error('No payment heads found for this application/type');
      }

      // Construct payload
      const payload = {
        gateway_id: gatewayId ?? 1,
        transcript_id: Number(applicationId),
        heads: headsPayload,
        amount: Number(totalAmount) || undefined,
        psid: this.getPsidByType(type),
        depositor: depositor || undefined,
        success_url: this.getCallbackUrl(applicationId, type, 'success'),
        fail_url: this.getCallbackUrl(applicationId, type, 'fail'),
        cancel_url: this.getCallbackUrl(applicationId, type, 'cancel')
      };

      // Initialize payment
      const response = await apiService.postClient(
        'management/eco/initiate_payment',
        payload,
        {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (response.success && response.data) {
        const raw: any = response.data;
        const data = raw?.data ?? raw;
        const url = data?.paymentUrl || data?.payment_url || data?.redirect_url || data?.GatewayPageURL;
        if (url) {
          return {
            success: true,
            data: {
              GatewayPageURL: url,
              payment_url: data?.payment_url || url,
              sessionkey: data?.sessionkey,
              redirect_url: data?.redirect_url || url,
            },
            message: data?.message || 'Payment initialized successfully'
          };
        }
      }

      // Normalize error message when API returns structured error
      const errMsg = typeof response.error === 'string' 
        ? response.error 
        : ((response.error && (response.error.message || response.error.error)) || JSON.stringify(response.error) || 'Failed to initialize payment');
      throw new Error(errMsg);
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: typeof error?.message === 'string' ? error.message : 'An unexpected error occurred'
      };
    }
  }

  public async verifyPayment(applicationId: number): Promise<PaymentVerificationResponse> {
    try {
      const response = await apiService.getClient(
        `/student/payment/status/${applicationId}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Payment status retrieved successfully'
        };
      }

      throw new Error(response.error || 'Failed to verify payment');
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify payment status'
      };
    }
  }

  public async getAvailableGateways() {
    try {
      const response = await apiService.getClient(
        '/student/get_all_payment_gateways?limit=10&page=1'
      );

      if (response.success && response.data) {
        const raw = response.data as any;
        const gateways = raw?.gateways ?? raw?.data?.gateways ?? (Array.isArray(raw) ? raw : undefined);
        if (Array.isArray(gateways)) return gateways;
      }

      throw new Error(
        typeof response.error === 'string' ? response.error : (response.error?.message || 'Failed to fetch payment gateways')
      );
    } catch (error: any) {
      console.error('Error fetching payment gateways:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
export default paymentService;
