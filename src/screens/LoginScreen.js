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
import {color, toast} from '../service/utils';
import {Platform} from 'react-native';
import { login } from '../service/auth';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('jahidul282@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!email || !email.includes('@')) {
        toast('danger', 'Please enter a valid email address');
        return;
      } else if (!password || password.length < 6) {
        toast('danger', 'Password must be at least 6 characters');
        return;
      }

      const authResponse = await login(email, password);
      
      if (authResponse.success) {
        navigation.navigate('Dashboard');
      } else {
        toast('danger', authResponse.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast('danger', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setAlt = () => {
    setEmail('s-2017918219@econ.du.ac.bd');
    setPassword('12345678');
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
            Student Portal for University of Dhaka
          </Heading>
          <VStack space={3} mt="5" width="100%">
            <FormControl>
              <FormControl.Label>Email Address</FormControl.Label>
              <Input
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
                isDisabled={loading}
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Password</FormControl.Label>
              <Input
                type="password"
                value={password}
                onChangeText={setPassword}
                isDisabled={loading}
                placeholder="Enter your password"
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
            <Button
              mt="2"
              variant="outline"
              colorScheme={'indigo'}
              onPress={setAlt}
              isDisabled={loading}>
              Set Alternative Credentials
            </Button>
          </VStack>
        </Box>
      </Center>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
