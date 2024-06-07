// NavigationListener.js

import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {statusCheck} from '../service/api';

const NavigationListener = ({children}) => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', async () => {
      const check = await statusCheck();
      if (check?.status != '1') {
        navigation.navigate('OutOfService');
      }
    });

    return unsubscribe;
  }, [navigation]);

  return <>{children}</>;
};

export default NavigationListener;
