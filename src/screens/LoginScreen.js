import React, {useState} from 'react';
import {Image} from 'react-native';
import {
  Box,
  Button,
  Center,
  FormControl,
  Heading,
  Input,
  VStack,
  KeyboardAvoidingView,
} from 'native-base';
import {API_SECRET_TOKEN, API_URL, appInfo, color, deviceInfo, netInfo, saveLogin, toast} from '../service/utils';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getLocales } from 'react-native-localize';
import axios from 'axios';

const LoginScreen = ({navigation}) => {
  const [reg, setReg] = useState('2017417693');
  const [password, setPassword] = useState('597230ask');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!reg || reg.length !== 10) {
        toast('danger', 'Invalid Registration Number');
        return;
      } else if (!password || password.length < 6) {
        toast('danger', 'Invalid Password');
        return;
      }
      const net = await netInfo();
      const Device = deviceInfo();
      const osVersion = Device.systemVersion || 0;
      const deviceName = `${DeviceInfo.getBrand()} - ${DeviceInfo.getModel()}`;
      const statusBarHeight = DeviceInfo.hasNotch() ? 30 : 20;
      const sessionId = DeviceInfo.getUniqueId();
      const lang = getLocales();
      const appVersion = (await appInfo()) || 1;

      const data = {
        action: 'login',
        reg,
        pass: password,
        netInfo: JSON.stringify(net),
        deviceName,
        osVersion,
        lang: JSON.stringify(lang),
        statusBarHeight,
        sessionId,
        ipAddress: net?.ip,
        device: JSON.stringify(Device),
        version: appVersion,
      };

      const response = await axios.post(API_URL, data, {
        headers: {'x-api-token': API_SECRET_TOKEN},
      });
      if (response.data.status === 200) {
        await saveLogin(response.data, reg);
        navigation.navigate('Dashboard');
      } else if (response.data.status === 300) {
        toast('danger', response.data.message || 'Account issue.');
      } else if (response.data.status === 201) {
        toast('danger', response.data.message || 'Account not verified.');
      } else if (response.data.status === 303 || response.data.status === 304) {
        toast('danger', response.data.message || 'Account locked or other issue.');
      } else {
        toast('danger', 'Something Went Wrong, Please Try Again Later.(1)');
        const errorData = [
          'Login',
          'Unknown Status Code sent For login',
          [reg, password, appVersion],
        ];
        console.log('🚀 ~ handleLogin ~ errorData:', errorData);
        // errorReport(errorData);
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast('danger', 'Something Went Wrong, Please Try Again Later.');
    } finally {
      setLoading(false);
    }
  };

  const setAlt = () => {
    setReg('2015614614');
    setPassword('asdf@123');
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
            Welcome to Britto
          </Heading>
          <Heading mt="1" color={color.secondary} fontWeight="medium" size="xs">
            Please sign in to continue!
          </Heading>
          <VStack space={3} mt="5" width="100%">
            <FormControl>
              <FormControl.Label>Registration Number</FormControl.Label>
              <Input
                value={reg}
                keyboardType="numeric"
                type="number"
                maxLength={10}
                onChangeText={setReg}
                isDisabled={loading}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Password</FormControl.Label>
              <Input
                type="password"
                value={password}
                onChangeText={setPassword}
                isDisabled={loading}
              />
            </FormControl>
            <Button
              mt="2"
              colorScheme={'indigo'}
              bg={color.primary}
              isLoading={loading}
              onPress={handleLogin}
              isDisabled={loading}>
              Sign in
            </Button>
          </VStack>
        </Box>
      </Center>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
