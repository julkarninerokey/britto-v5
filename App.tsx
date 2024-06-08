// App.js

import React from 'react';
import {NativeBaseProvider} from 'native-base';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';
import OutOfServiceScreen from './src/screens/OutOfServiceScreen';
import NavigationListener from './src/components/NavigationListener';
import FlashMessage from 'react-native-flash-message';
import Dashboard from './src/screens/dashboard/Dashboard';
import Profile from './src/screens/dashboard/Profile';
import Hall from './src/screens/dashboard/Hall';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <NavigationListener>
          <Stack.Navigator initialRouteName={'Login'}>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{title: 'Login', headerShown: false}}
            />
            <Stack.Screen
              name="OutOfService"
              component={OutOfServiceScreen}
              options={{title: 'Out of Service', headerShown: false}}
            />
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{title: 'Dashboard', headerShown: false}}
            />
            <Stack.Screen
              name="Profile"
              component={Profile}
              options={{title: 'Profile', headerShown: false}}
            />
            <Stack.Screen
              name="Hall"
              component={Hall}
              options={{title: 'Hall', headerShown: false}}
            />
          </Stack.Navigator>
          <FlashMessage position="top" />
        </NavigationListener>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
