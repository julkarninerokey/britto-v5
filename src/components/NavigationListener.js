// NavigationListener.js

import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {statusCheck} from '../service/api';

const NavigationListener = ({children}) => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', async () => {
      const check = await statusCheck();
      
      if (check && check?.status !== '1') {
        navigation.navigate('OutOfService');
        console.log("🚀 ~ NavigationListener ~ check:", check?.status)
      console.log("🚀 ~ NavigationListener ~ check:typeof ", typeof check?.status)
      }else{
      console.log("🚀 ~ NavigationListener ~ check else:", check)
      navigation.navigate('Login');

      }
    });

    return unsubscribe;
  }, [navigation]);

  return <>{children}</>;
};

export default NavigationListener;
