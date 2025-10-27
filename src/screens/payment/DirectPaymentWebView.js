import React, { useState, useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Button,
  Center,
  Skeleton,
} from 'native-base';
import { WebView } from 'react-native-webview';
import AppBar from '../../components/AppBar';
import { color, toast } from '../../service/utils';
import paymentService from '../../service/payments/paymentService';

const DirectPaymentWebView = ({ route, navigation }) => {
  const { 
    paymentUrl, 
    applicationId, 
    amount, 
    depositor, 
    examName, 
    courses,
    onPaymentComplete 
  } = route.params;

  const [webViewVisible, setWebViewVisible] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Handle back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    if (webViewVisible) {
      handleCancelPayment();
      return true;
    }
    return false;
  };

  const handleCancelPayment = () => {
    setWebViewVisible(false);
    toast('warning', 'Payment Cancelled', 'Payment was cancelled.');
    navigation.goBack();
  };

  const checkPaymentStatus = async () => {
    setVerifying(true);
    try {
      const response = await paymentService.verifyPayment(applicationId);
      
      if (response.success && response.data) {
        const status = response.data.status;
        
        if (status === 'VALID') {
          toast('success', 'Payment Successful', 'Your payment has been completed successfully!');
          
          // Call completion callback if provided
          if (onPaymentComplete) {
            onPaymentComplete({ success: true, status: 'completed' });
          }
          
          // Navigate back after a short delay
          setTimeout(() => {
            navigation.navigate('Enrollment');
          }, 2000);
          
        } else if (status === 'INVALID') {
          toast('error', 'Payment Failed', 'Payment was not successful. Please try again.');
          navigation.goBack();
          
        } else {
          toast('info', 'Payment Pending', 'Payment is still being processed.');
          navigation.goBack();
        }
      } else {
        toast('error', 'Error', response.message || 'Failed to check payment status');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      toast('error', 'Error', 'Failed to check payment status');
      navigation.goBack();
    } finally {
      setVerifying(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log('WebView URL changed:', url);
    
    // Check for success/failure URLs
    if (url.includes('success') || url.includes('payment-success')) {
      setWebViewVisible(false);
      toast('info', 'Payment Processing', 'Please wait while we verify your payment...');
      setTimeout(() => {
        checkPaymentStatus();
      }, 3000);
    } else if (url.includes('fail') || url.includes('cancel') || url.includes('payment-failed')) {
      setWebViewVisible(false);
      toast('warning', 'Payment Cancelled', 'Payment was cancelled or failed.');
      navigation.goBack();
    }
  };

  if (!webViewVisible) {
    return (
      <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
        <AppBar title="Payment Processing" />
        <Center flex={1}>
          <VStack space={3} alignItems="center">
            <Text fontSize="xl">⏳</Text>
            <Text fontSize="md" fontWeight="600" color={color.text}>
              Processing Payment
            </Text>
            <Text fontSize="sm" color={color.muted} textAlign="center">
              Please wait while we verify your payment status...
            </Text>
            {verifying && <Skeleton h={4} w="200" borderRadius={4} />}
          </VStack>
        </Center>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Payment Gateway" />
      
      <VStack flex={1}>
        {/* Payment Info Header */}
        <HStack p={3} bg={color.lightBlue} alignItems="center" justifyContent="space-between">
          <VStack flex={1}>
            <Text fontSize="sm" fontWeight="600" color={color.text}>
              Amount: ৳{amount}
            </Text>
            {examName && (
              <Text fontSize="xs" color={color.muted}>
                {examName} {courses ? `• ${courses} courses` : ''}
              </Text>
            )}
          </VStack>
          <Button
            size="sm"
            variant="outline"
            borderColor={color.primary}
            onPress={handleCancelPayment}
            _text={{ color: color.primary, fontSize: 'xs' }}
          >
            Cancel
          </Button>
        </HStack>
        
        {/* WebView */}
        <WebView
          source={{ uri: paymentUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
          renderLoading={() => (
            <Center flex={1}>
              <VStack space={3} alignItems="center">
                <Text fontSize="lg">💳</Text>
                <Text fontSize="sm" color={color.muted}>Loading payment gateway...</Text>
                <Skeleton h={4} w="200" borderRadius={4} />
              </VStack>
            </Center>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            toast('error', 'Payment Error', 'Failed to load payment gateway');
            navigation.goBack();
          }}
          onLoadEnd={() => {
            console.log('Payment WebView loaded successfully');
          }}
        />
      </VStack>
    </View>
  );
};

export default DirectPaymentWebView;
