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
    card_issuer?: string;
    amount_details?: {
      currency_amount?: number;
      currency_rate?: number;
      base_fair?: number;
    };
  };
  message?: string;
}

export interface PaymentGateway {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  environment: string;
  status: number;
  supported_methods: string[];
  supported_currencies: string[];
}