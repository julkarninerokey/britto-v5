import React, { useState, useEffect } from 'react';
import { View, Linking, Alert, BackHandler } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  ScrollView,
  Skeleton,
  Center,
  Divider,
  Badge,
  Icon,
  Pressable,
} from 'native-base';
import { WebView } from 'react-native-webview';
import AppBar from '../../components/AppBar';
import { color, toast } from '../../service/utils';
import paymentService from '../../service/payments/paymentService';
import { getAsyncStoreData } from '../../utils/async-storage';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const Payment = ({ route, navigation }) => {
  // Route params can come from two sources:
  // 1. Direct payment (existing enrollment): { applicationId, type, amount, courses, examName, studentRegNo }
  // 2. New enrollment flow: { applicationId, type } - we'll fetch details
  const { applicationId, type = type, amount, courses, examName, totalAmount, studentRegNo: passedStudentRegNo } = route.params;
  console.log("🚀 ~ Payment ~ route.params:", route.params)
  
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [studentRegNo, setStudentRegNo] = useState('');

  useEffect(() => {
    console.log('Payment screen params:', { applicationId, type, amount, courses, examName, totalAmount, passedStudentRegNo });
    
    // Load student registration number
    loadStudentRegNo();
    
    // If we have direct amount, use it; otherwise fetch application details
    if (amount || totalAmount) {
      setCalculatedTotal(amount || totalAmount);
      setDetailsLoading(false);
    } else {
      fetchApplicationDetails();
    }
    
    // Handle back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [showWebView]);

  const loadStudentRegNo = async () => {
    try {
      // If registration number was passed as parameter, use it first
      if (passedStudentRegNo) {
        setStudentRegNo(passedStudentRegNo);
        console.log('Student Reg No from route params:', passedStudentRegNo);
        return;
      }
      
      // Try to get from studentDetails
      const studentDetailsStr = await getAsyncStoreData('studentDetails');
      if (studentDetailsStr) {
        const studentDetails = JSON.parse(studentDetailsStr);
        setStudentRegNo(studentDetails.regNo || '');
        console.log('Student Reg No from studentDetails:', studentDetails.regNo);
        return;
      }
      
      // Fallback to individual key
      const regNo = await getAsyncStoreData('reg');
      if (regNo) {
        setStudentRegNo(regNo);
        console.log('Student Reg No from reg key:', regNo);
        return;
      }
      
      console.warn('Student registration number not found in storage');
    } catch (error) {
      console.error('Error loading student registration number:', error);
    }
  };

  const fetchApplicationDetails = async () => {
    if (!applicationId) {
      toast('error', 'Error', 'Application ID is required');
      navigation.goBack();
      return;
    }

    setDetailsLoading(true);
    try {
      const response = await paymentService.getApplicationPaymentDetails(Number(applicationId), type);
      
      if (response.success && response.data) {
        setApplicationDetails(response.data);
        
        // Calculate total from payment details
        const total = response.data.payment_details.reduce((sum, item) => sum + item.total, 0);
        setCalculatedTotal(total);
        
        console.log('Application details loaded:', response.data);
        console.log('Calculated total:', total);
      } else {
        toast('error', 'Error', response.message || 'Failed to load application details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast('error', 'Error', 'Failed to load application details');
      navigation.goBack();
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBackPress = () => {
    if (showWebView) {
      setShowWebView(false);
      setPaymentUrl('');
      return true;
    }
    return false;
  };

  const initPayment = async () => {
    if (!applicationId || !calculatedTotal) {
      toast('error', 'Error', 'Invalid payment parameters');
      return;
    }

    setLoading(true);
    try {
      // Determine depositor: use from application details, student reg no, or fallback
      const depositor = applicationDetails?.admitted_student_reg_no?.toString() || 
                       studentRegNo || 
                       '';
      
      console.log('Initializing payment for:', {
        applicationId,
        total: calculatedTotal,
        type,
        depositor: depositor,
        studentRegNo: studentRegNo,
        passedStudentRegNo: passedStudentRegNo
      });
      
      // Auto-select first available gateway
      let gatewayId = 1;
      try {
        const gateways = await paymentService.getAvailableGateways();
        if (Array.isArray(gateways) && gateways.length > 0) {
          gatewayId = gateways[0].id || 1;
        }
      } catch (e) {
        console.warn('Failed to fetch gateways, defaulting to 1:', e?.message || e);
      }

      const response = await paymentService.initializePayment(
        Number(applicationId),
        Number(calculatedTotal),
        type,
        depositor,
        gatewayId
      );
      
      console.log("🚀 ~ initPayment ~ response:", response);
      
      if (response.success && response.data?.GatewayPageURL) {
        setPaymentUrl(response.data.GatewayPageURL);
        setShowWebView(true);
        toast('success', 'Payment Initialized', 'Redirecting to payment gateway...');
      } else {
        console.log('Payment initialization failed:', response);
        toast('error', 'Payment Failed', response.message || 'Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast('error', 'Error', 'An unexpected error occurred during payment initialization');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    setVerifying(true);
    try {
      const response = await paymentService.verifyPayment(Number(applicationId));
      
      if (response.success && response.data) {
        setPaymentStatus(response.data);
        
        if (response.data.status === 'VALID') {
          toast('success', 'Payment Successful', 'Your payment has been completed successfully!');
          // Navigate back to enrollment or dashboard
          setTimeout(() => {
            navigation.navigate('Enrollment');
          }, 2000);
        } else if (response.data.status === 'INVALID') {
          toast('error', 'Payment Failed', 'Payment was not successful. Please try again.');
        } else {
          toast('info', 'Payment Pending', 'Payment is still being processed.');
        }
      } else {
        toast('error', 'Error', response.message || 'Failed to check payment status');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      toast('error', 'Error', 'Failed to check payment status');
    } finally {
      setVerifying(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log('WebView URL changed:', url);
    
    // Check for success/failure URLs
    if (url.includes('success') || url.includes('payment-success')) {
      setShowWebView(false);
      toast('info', 'Payment Processing', 'Please wait while we verify your payment...');
      setTimeout(() => {
        checkPaymentStatus();
      }, 3000);
    } else if (url.includes('fail') || url.includes('cancel') || url.includes('payment-failed')) {
      setShowWebView(false);
      toast('warning', 'Payment Cancelled', 'Payment was cancelled or failed.');
    }
  };

  const getTypeDisplay = () => {
    switch (type?.toUpperCase()) {
      case 'ENROLMENT':
      case 'ENROLLMENT': 
        return 'Course Enrollment';
      case 'FORM_FILLUP': 
        return 'Form Fillup';
      case 'TRANSCRIPT': 
        return 'Transcript';
      case 'CERTIFICATE': 
        return 'Certificate';
      default: 
        return 'Payment';
    }
  };

  const getStatusColor = () => {
    if (!paymentStatus) return color.muted;
    switch (paymentStatus.status) {
      case 'VALID': return color.success;
      case 'INVALID': return color.danger;
      case 'PENDING': return color.warning;
      default: return color.muted;
    }
  };

  // Loading skeleton for application details
  if (detailsLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
        <AppBar title="Payment" />
        <VStack flex={1} p={4}>
          <VStack space={4}>
            <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
              <VStack space={3}>
                <HStack alignItems="center" space={3}>
                  <Skeleton w={8} h={8} borderRadius={20} />
                  <VStack flex={1} space={2}>
                    <Skeleton h={4} w="200" borderRadius={4} />
                    <Skeleton h={3} w="150" borderRadius={4} />
                  </VStack>
                </HStack>
                <Divider />
                <VStack space={2}>
                  <Skeleton h={4} w="full" borderRadius={4} />
                  <Skeleton h={4} w="full" borderRadius={4} />
                  <Skeleton h={4} w="full" borderRadius={4} />
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </View>
    );
  }

  if (showWebView && paymentUrl) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="Payment Gateway" />
        <VStack flex={1}>
          <HStack p={3} bg={color.lightBlue} alignItems="center" justifyContent="space-between">
            <Text fontSize="sm" color={color.text}>
              Complete your payment securely
            </Text>
            <Button
              size="sm"
              variant="outline"
              borderColor={color.primary}
              onPress={() => setShowWebView(false)}
              _text={{ color: color.primary, fontSize: 'xs' }}
            >
              Cancel
            </Button>
          </HStack>
          
          <WebView
            source={{ uri: paymentUrl }}
            style={{ flex: 1 }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            renderLoading={() => (
              <Center flex={1}>
                <VStack space={3} alignItems="center">
                  <Text fontSize="lg">💳</Text>
                  <Text fontSize="sm" color={color.muted}>Loading payment gateway...</Text>
                  <Skeleton h={4} w="200" borderRadius={4} />
                </VStack>
              </Center>
            )}
          />
        </VStack>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
      <AppBar title="Payment" />
      <VStack flex={1} p={4}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space={4}>
            
            {/* Application Details Card */}
            {applicationDetails && (
              <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
                <VStack space={3}>
                  <HStack alignItems="center" space={3}>
                    <Text fontSize="xl">👤</Text>
                    <VStack flex={1}>
                      <Text fontSize="lg" fontWeight="600" color={color.text}>
                        {applicationDetails.admitted_student_name || 'Student'}
                      </Text>
                      <Text fontSize="sm" color={color.muted}>
                        Reg: {applicationDetails.admitted_student_reg_no || 'N/A'}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Divider />
                  
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="md" color={color.text}>Department:</Text>
                      <Text fontSize="md" fontWeight="500" color={color.text}>
                        {applicationDetails.degree_name || 'N/A'}
                      </Text>
                    </HStack>
                    
                    <HStack justifyContent="space-between">
                      <Text fontSize="md" color={color.text}>Application For:</Text>
                      <Text fontSize="md" fontWeight="500" color={color.text}>
                        {applicationDetails.application_type || 'N/A'}
                      </Text>
                    </HStack>
                    
                    {(applicationDetails.admitted_student_reg_no || studentRegNo) && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="md" color={color.text}>Depositor:</Text>
                        <Text fontSize="md" fontWeight="500" color={color.primary}>
                          {applicationDetails.admitted_student_reg_no || studentRegNo}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </Box>
            )}
            
            {/* Payment Summary Card */}
            <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
              <VStack space={3}>
                <HStack alignItems="center" space={3}>
                  <Text fontSize="xl">💳</Text>
                  <VStack flex={1}>
                    <Text fontSize="lg" fontWeight="600" color={color.text}>
                      Payment Invoice
                    </Text>
                    <Text fontSize="sm" color={color.muted}>
                      Application ID: {applicationId}
                    </Text>
                  </VStack>
                </HStack>
                
                <Divider />
                
                {/* Payment Details Items */}
                {applicationDetails?.payment_details && applicationDetails.payment_details.length > 0 ? (
                  <VStack space={2}>
                    <Text fontSize="md" fontWeight="600" color={color.text}>
                      Payment Details:
                    </Text>
                    {applicationDetails.payment_details.map((item, index) => (
                      <HStack key={index} justifyContent="space-between" alignItems="center" py={2} px={3} bg={color.lightBlue} borderRadius={8}>
                        <VStack flex={1}>
                          <Text fontSize="sm" fontWeight="500" color={color.text}>
                            {item.name}
                          </Text>
                          <Text fontSize="xs" color={color.muted}>
                            Rate: ৳{item.unit_price} × {item.quantity}
                          </Text>
                        </VStack>
                        <Text fontSize="md" fontWeight="600" color={color.primary}>
                          ৳{item.total}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="md" color={color.text}>Service Type:</Text>
                      <Text fontSize="md" fontWeight="500" color={color.primary}>
                        {getTypeDisplay()}
                      </Text>
                    </HStack>
                    
                    {examName && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="md" color={color.text}>Exam:</Text>
                        <Text fontSize="md" fontWeight="500" color={color.text}>
                          {examName}
                        </Text>
                      </HStack>
                    )}
                    
                    {courses && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="md" color={color.text}>Courses:</Text>
                        <Text fontSize="md" fontWeight="500" color={color.text}>
                          {courses} {courses > 1 ? 'courses' : 'course'}
                        </Text>
                      </HStack>
                    )}
                    
                    {studentRegNo && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="md" color={color.text}>Depositor:</Text>
                        <Text fontSize="md" fontWeight="500" color={color.primary}>
                          {studentRegNo}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                )}
                
                <Divider />
                
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="lg" fontWeight="600" color={color.text}>
                    Total Amount:
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color={color.primary}>
                    ৳{calculatedTotal}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Payment Status */}
            {paymentStatus && (
              <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
                <VStack space={3}>
                  <HStack alignItems="center" space={3}>
                    <Text fontSize="xl">📊</Text>
                    <Text fontSize="lg" fontWeight="600" color={color.text}>
                      Payment Status
                    </Text>
                  </HStack>
                  
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="md" color={color.text}>Status:</Text>
                    <Badge 
                      bg={getStatusColor()} 
                      borderRadius={8}
                      px={3}
                      py={1}
                      _text={{ color: 'white', fontWeight: '600' }}
                    >
                      {paymentStatus.status}
                    </Badge>
                  </HStack>
                  
                  {paymentStatus.tran_id && (
                    <HStack justifyContent="space-between">
                      <Text fontSize="md" color={color.text}>Transaction ID:</Text>
                      <Text fontSize="sm" fontWeight="500" color={color.text}>
                        {paymentStatus.tran_id}
                      </Text>
                    </HStack>
                  )}
                  
                  {paymentStatus.bank_tran_id && (
                    <HStack justifyContent="space-between">
                      <Text fontSize="md" color={color.text}>Bank Transaction:</Text>
                      <Text fontSize="sm" fontWeight="500" color={color.text}>
                        {paymentStatus.bank_tran_id}
                      </Text>
                    </HStack>
                  )}
                  
                  {paymentStatus.card_type && (
                    <HStack justifyContent="space-between">
                      <Text fontSize="md" color={color.text}>Payment Method:</Text>
                      <Text fontSize="sm" fontWeight="500" color={color.text}>
                        {paymentStatus.card_type} - {paymentStatus.card_brand}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}

            {/* Payment Instructions */}
            <Box bg={color.lightBlue} p={4} borderRadius={12}>
              <VStack space={2}>
                <Text fontSize="md" fontWeight="600" color={color.text}>
                  ✅ Payment Instructions
                </Text>
                <Text fontSize="sm" color={color.text}>
                  • Click "Proceed to Payment" to open the secure payment gateway
                </Text>
                <Text fontSize="sm" color={color.text}>
                  • Complete your payment using your preferred method
                </Text>
                <Text fontSize="sm" color={color.text}>
                  • You will be redirected back automatically after payment
                </Text>
                <Text fontSize="sm" color={color.text}>
                  • Keep your transaction ID for future reference
                </Text>
              </VStack>
            </Box>
            
          </VStack>
        </ScrollView>
        
        {/* Action Buttons */}
        <VStack space={3} pt={4}>
          <HStack space={3}>
            {/* Cancel button */}
            <Button
              variant="outline"
              borderColor={color.muted}
              onPress={() => navigation.goBack()}
              flex={1}
              borderRadius={12}
              py={3}
              _text={{
                color: color.text,
                fontWeight: "600",
              }}
            >
              Cancel
            </Button>

            {/* Proceed to Payment */}
            <Button
              bg={color.primary}
              onPress={initPayment}
              isLoading={loading}
              flex={2}
              borderRadius={12}
              py={3}
              _text={{
                color: "white",
                fontWeight: "700",
                fontSize: "md",
              }}
              startIcon={
                <Icon
                  as={MaterialIcons}
                  name="credit-card"
                  size="sm"
                  color="white"
                />
              }
            >
              Proceed to Payment
            </Button>
          </HStack>

          {/* Check Status */}
          <Button
            variant="outline"
            borderColor={color.secondary}
            onPress={checkPaymentStatus}
            isLoading={verifying}
            borderRadius={12}
            py={2}
            _text={{
              color: color.secondary,
              fontWeight: "600",
            }}
          >
            Check Payment Status
          </Button>
        </VStack>

      </VStack>
    </View>
  );
};

export default Payment;
