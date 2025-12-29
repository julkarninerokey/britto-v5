import React, {useState} from 'react';
import {Image, Platform} from 'react-native';
import {
  Box,
  Button,
  Center,
  FormControl,
  Heading,
  Input,
  KeyboardAvoidingView,
  Text,
  VStack,
} from 'native-base';
import {color, toast} from '../service/utils';
import {sendLoginOtp, verifyLoginOtp} from '../service/auth';

const PasswordlessLoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      toast('danger', 'Please enter a valid email address');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await sendLoginOtp(trimmedEmail);
      if (response.success) {
        setOtp('');
        setOtpSent(true);
        toast('success', response.message || 'OTP sent successfully.');
      } else {
        toast('danger', response.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('OTP Send Error:', error);
      toast('danger', 'Unable to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      toast('danger', 'Please enter a valid email address');
      return;
    }

    if (!trimmedOtp || trimmedOtp.length < 4) {
      toast('danger', 'Enter the OTP sent to your email');
      return;
    }

    setVerifyingOtp(true);
    try {
      const authResponse = await verifyLoginOtp(trimmedEmail, trimmedOtp);

      if (authResponse.success) {
        navigation.navigate('Dashboard');
      } else {
        toast('danger', authResponse.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP Verify Error:', error);
      toast('danger', 'Unable to verify OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <Center flex={1} bg={color.secondaryBackground}>
        <Box
          safeArea
          w={'80%'}
          p={10}
          alignItems="center"
          bg={color.background}>
          <Image
            source={require('../assets/logo.png')}
            style={{width: 100, height: 150, marginBottom: 10}}
          />
          <Heading size="lg" fontWeight="600" color={color.primary}>
            Passwordless Login
          </Heading>
          <Text mt="2" textAlign="center" color={color.secondary}>
            We will send a one-time code to your email.
          </Text>
          <VStack space={3} mt="5" width="100%">
            <FormControl>
              <FormControl.Label>Email Address</FormControl.Label>
              <Input
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setEmail}
                isDisabled={sendingOtp || verifyingOtp}
                placeholder="Enter your email"
              />
            </FormControl>
            {otpSent && (
              <FormControl>
                <FormControl.Label>One Time Password</FormControl.Label>
                <Input
                  value={otp}
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={value => setOtp(value.replace(/[^0-9]/g, ''))}
                  isDisabled={verifyingOtp}
                  placeholder="Enter the 6-digit code"
                />
                <FormControl.HelperText>
                  Check your inbox for the verification code.
                </FormControl.HelperText>
              </FormControl>
            )}
            <Button
              mt="2"
              colorScheme={'indigo'}
              bg={color.primary}
              onPress={handleSendOtp}
              isLoading={sendingOtp}
              isDisabled={sendingOtp || verifyingOtp}>
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </Button>
            <Button
              mt="2"
              variant="outline"
              colorScheme={'indigo'}
              onPress={handleVerifyOtp}
              isLoading={verifyingOtp}
              isDisabled={!otpSent || !otp || verifyingOtp}>
              Verify & Sign In
            </Button>
            <Button
              mt="2"
              variant="ghost"
              colorScheme={'indigo'}
              onPress={() => navigation.navigate('Login')}
              isDisabled={sendingOtp || verifyingOtp}>
              Back to Password Login
            </Button>
          </VStack>
        </Box>
      </Center>
    </KeyboardAvoidingView>
  );
};

export default PasswordlessLoginScreen;
