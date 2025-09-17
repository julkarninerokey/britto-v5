import { Alert } from 'react-native';
import { initializeSSLCommerzPayment } from './paymentService';
import { getAsyncStoreData } from '../utils/async-storage';
import { toast } from './utils';
import { PAYMENT_CONFIG } from '../config/paymentConfig';

// Direct payment handler - opens payment gateway in app WebView
export const handleDirectPayment = async ({
  applicationId,
  amount,
  type = 'ENROLMENT',
  depositor,
  studentRegNo,
  examName,
  courses,
  navigation,
  onSuccess,
  onError,
  onCancel
}) => {
  try {
    console.log('🚀 Direct Payment - Starting payment for:', {
      applicationId,
      amount,
      type,
      depositor,
      studentRegNo
    });

    // Determine depositor if not provided
    let finalDepositor = depositor;
    if (!finalDepositor) {
      finalDepositor = studentRegNo;
      
      // Try to get from storage if still not available
      if (!finalDepositor) {
        try {
          const studentDetailsStr = await getAsyncStoreData('studentDetails');
          if (studentDetailsStr) {
            const studentDetails = JSON.parse(studentDetailsStr);
            finalDepositor = studentDetails.regNo || '';
          }
          
          if (!finalDepositor) {
            const regNo = await getAsyncStoreData('reg');
            finalDepositor = regNo || '';
          }
        } catch (error) {
          console.error('Error loading student reg no for payment:', error);
        }
      }
    }

    console.log('🚀 Direct Payment - Final depositor:', finalDepositor);

    // Show confirmation if enabled
    if (PAYMENT_CONFIG.SHOW_PAYMENT_CONFIRMATION) {
      const confirmPayment = await new Promise((resolve) => {
        Alert.alert(
          "Confirm Payment",
          `Amount: ৳${amount}\n${examName ? `Exam: ${examName}\n` : ''}${courses ? `Courses: ${courses}\n` : ''}Depositor: ${finalDepositor}\n\nProceed to payment gateway?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve(false)
            },
            {
              text: "Pay Now",
              style: "default",
              onPress: () => resolve(true)
            }
          ]
        );
      });

      if (!confirmPayment) {
        if (onCancel) onCancel();
        return;
      }
    }

    // Show loading toast
    // toast('info', 'Initializing Payment', 'Please wait while we prepare your payment...');

    // Initialize payment
    const response = await initializeSSLCommerzPayment(
      applicationId,
      amount,
      type,
      finalDepositor
    );

    console.log('🚀 Direct Payment - Response:', response);

    if (response.success && response.data?.GatewayPageURL) {
      // Success - navigate to WebView screen
      const paymentUrl = response.data.GatewayPageURL;
      
    //   toast('success', 'Payment Gateway', 'Opening payment gateway...');
      
      // Navigate to DirectPaymentWebView screen
      if (navigation) {
        navigation.navigate('DirectPaymentWebView', {
          paymentUrl,
          applicationId,
          amount,
          depositor: finalDepositor,
          examName,
          courses,
          onPaymentComplete: onSuccess
        });
      } else {
        throw new Error('Navigation object not provided');
      }
      
    } else {
      // Payment initialization failed
      const errorMessage = response.message || 'Failed to initialize payment. Please try again.';
      toast('error', 'Payment Failed', errorMessage);
      
      if (onError) {
        onError(new Error(errorMessage));
      }
    }
    
  } catch (error) {
    console.error('Direct payment error:', error);
    
    const errorMessage = error.message || 'An unexpected error occurred during payment initialization';
    toast('error', 'Payment Error', errorMessage);
    
    if (onError) {
      onError(error);
    }
  }
};

// Check payment status after returning from external payment
export const checkPaymentStatusAfterReturn = async (applicationId) => {
  try {
    // Import payment status function
    const { getPaymentStatus } = require('./paymentService');
    
    const response = await getPaymentStatus(applicationId);
    
    if (response.success && response.data) {
      const status = response.data.status;
      
      switch (status) {
        case 'VALID':
          toast('success', 'Payment Successful', 'Your payment has been completed successfully!');
          return { success: true, status: 'completed' };
          
        case 'INVALID':
          toast('error', 'Payment Failed', 'Payment was not successful. Please try again.');
          return { success: false, status: 'failed' };
          
        case 'PENDING':
        default:
          toast('info', 'Payment Pending', 'Payment is still being processed.');
          return { success: true, status: 'pending' };
      }
    } else {
      toast('warning', 'Status Check Failed', 'Could not verify payment status. Please check manually.');
      return { success: false, status: 'unknown' };
    }
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    toast('error', 'Status Check Error', 'Failed to check payment status.');
    return { success: false, status: 'error' };
  }
};
