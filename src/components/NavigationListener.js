// NavigationListener.js

import React, {useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {statusCheck} from '../service/api';

const NavigationListener = ({children}) => {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    let isActive = true;
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const check = await statusCheck();
        if (!isActive) return;
        if (check && check?.status !== '1') {
          if (route.name !== 'OutOfService') {
            navigation.navigate('OutOfService');
          }
        } else {
          if (route.name !== 'Login') {
            navigation.navigate('Login');
          }
        }
      } catch (error) {
         toast('danger', 'Error', 'Failed to check status. Please try again later.');
      }
    });
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [navigation, route.name]);

  return <>{children}</>;
};

export default NavigationListener;
