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
import {login} from '../service/api';
import {color} from '../service/utils';
import {Platform} from 'react-native';

const LoginScreen = ({navigation}) => {
  const [reg, setReg] = useState('2017417693');
  const [password, setPassword] = useState('597230ask');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      var check = await login(reg, password);
      if (check === 200) {
        navigation.navigate('Dashboard');
      } else {
        console.log('🚀 ~ handleLogin ~ check:', check);
      }
    } catch (error) {
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
