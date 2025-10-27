import React, { useState, useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import { Center, Skeleton, Text, VStack } from 'native-base';
import { WebView, WebViewNavigation } from 'react-native-webview';
import AppBar from '../../components/AppBar';
import { color } from '../../service/utils';
import { paymentService } from '../../service/payments/paymentService';

interface PaymentWebViewProps {
  route: {
    params: {
      paymentUrl: string;
      applicationId: number;
      amount: number;
      depositor?: string;
      examName?: string;
      courses?: string;
      onPaymentComplete?: (result: { success: boolean; status: string }) => void;
    };
  };
  navigation: any;
}

const PaymentWebView: React.FC<PaymentWebViewProps> = ({ route, navigation }) => {
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
    navigation.goBack();
  };

  const checkPaymentStatus = async () => {
    setVerifying(true);
    try {
      const response = await paymentService.verifyPayment(applicationId);
      
      if (response.success && response.data) {
        const status = response.data.status;
        
        if (status === 'VALID') {
          if (onPaymentComplete) {
            onPaymentComplete({ success: true, status: 'completed' });
          }
          setTimeout(() => navigation.goBack(), 1000);
        } else if (status === 'INVALID') {
          if (onPaymentComplete) {
            onPaymentComplete({ success: false, status: 'failed' });
          }
          navigation.goBack();
        } else {
          if (onPaymentComplete) {
            onPaymentComplete({ success: true, status: 'pending' });
          }
          navigation.goBack();
        }
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      navigation.goBack();
    } finally {
      setVerifying(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;
    console.log('WebView URL changed:', url);
    
    if (url.includes('success') || url.includes('payment-success')) {
      setWebViewVisible(false);
      setTimeout(checkPaymentStatus, 2000);
    } else if (url.includes('fail') || url.includes('cancel') || url.includes('payment-failed')) {
      setWebViewVisible(false);
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
      <WebView
        source={{ uri: paymentUrl }}
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
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
          navigation.goBack();
        }}
      />
    </View>
  );
};

export default PaymentWebView;