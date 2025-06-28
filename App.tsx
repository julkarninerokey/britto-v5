import 'react-native-gesture-handler'; // <- this should be first
import React from 'react';
// import { enableScreens } from 'react-native-screens';
// enableScreens(); // <- this line is mandatoryimport {NativeBaseProvider} from 'native-base';

import { NativeBaseProvider } from 'native-base';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from './src/screens/LoginScreen';
import OutOfServiceScreen from './src/screens/OutOfServiceScreen';
import NavigationListener from './src/components/NavigationListener';
import FlashMessage from 'react-native-flash-message';
import Dashboard from './src/screens/dashboard/Dashboard';
import Profile from './src/screens/dashboard/Profile';
import Hall from './src/screens/dashboard/Hall';
import {SafeAreaProvider, initialWindowMetrics} from 'react-native-safe-area-context';
import Department from './src/screens/dashboard/Department';
import Syllabus from './src/screens/dashboard/Syllabus';
import Notice from './src/screens/dashboard/Notice';
import Examination from './src/screens/dashboard/Examination';
import Result from './src/screens/dashboard/Result';
import Marksheet from './src/screens/dashboard/Marksheet';
import Certificate from './src/screens/dashboard/Certificate';
import Transcript from './src/screens/dashboard/Transcript';
import { SafeAreaView, StatusBar } from 'react-native';
import { color } from './src/service/utils';
import FormFillup from './src/screens/dashboard/FormFillup';


const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NativeBaseProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: color.primary }}>
      <StatusBar barStyle="light-content" animated />
        <NavigationContainer>
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
              <Stack.Screen
                name="Department"
                component={Department}
                options={{title: 'Department', headerShown: false}}
              />
              <Stack.Screen
                name="Syllabus"
                component={Syllabus}
                options={{title: 'Syllabus', headerShown: false}}
              />
              <Stack.Screen
                name="Notice"
                component={Notice}
                options={{title: 'Notice', headerShown: false}}
              />
              <Stack.Screen
                name="Examination"
                component={Examination}
                options={{title: 'Examination', headerShown: false}}
              />
              <Stack.Screen
                name="FormFillup"
                component={FormFillup}
                options={{title: 'Form Fillup', headerShown: false}}
              />
              <Stack.Screen
                name="Result"
                component={Result}
                options={{title: 'Result', headerShown: false}}
              />
              <Stack.Screen
                name="Marksheet"
                component={Marksheet}
                options={{title: 'Marksheet', headerShown: false}}
              />
              <Stack.Screen
                name="Certificate"
                component={Certificate}
                options={{title: 'Certificate', headerShown: false}}
              />
              <Stack.Screen
                name="Transcript"
                component={Transcript}
                options={{title: 'Transcript', headerShown: false}}
              />
            </Stack.Navigator>
            <FlashMessage position="top" />
        </NavigationContainer>
        </SafeAreaView>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
};

export default App;
