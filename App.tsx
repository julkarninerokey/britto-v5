import 'react-native-gesture-handler'; // <- this should be first
import './src/setup/disableSSRWarning';
import React, { useEffect, useState } from 'react';
import { enableScreens } from 'react-native-screens';
// enableScreens(); // <- this line is mandatory
import { Animated } from "react-native";

// Import and setup console management
import { setupConsole, ConsoleManager } from './src/utils/consoleManager';

// Setup console based on configuration
setupConsole();

// Example: You can control logging at runtime
// ConsoleManager.setAppLogging(false);    // Disable app warnings
// ConsoleManager.setTerminalLogging(true); // Enable terminal output

// For debugging, you can force logs that bypass all filters:
// ConsoleManager.forceLog('This will always show in terminal');
// ConsoleManager.forceError('This error will always show in terminal');

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
import Result from './src/screens/dashboard/Result';
import Marksheet from './src/screens/dashboard/Marksheet';
import Certificate from './src/screens/dashboard/Certificate';
import Transcript from './src/screens/dashboard/Transcript';
import CalendarScreen from './src/screens/dashboard/Calendar';
import CampusMapWeb from './src/screens/dashboard/CampusMapWeb';
import ProctorScreen from './src/screens/proctor/ProctorScreen';
import NewProctorReport from './src/screens/proctor/NewProctorReport';
import Payment from './src/screens/dashboard/Payment';
import DirectPaymentWebView from './src/screens/payment/DirectPaymentWebView';
import { SafeAreaView, StatusBar } from 'react-native';
import { color } from './src/service/utils';
import FormFillup from './src/screens/dashboard/FormFillup';
import { isAuthenticated } from './src/service/auth';
import Enrollment from './src/screens/dashboard/Enrollment';
import { navigationRef } from './src/navigation/navigationService';
import './src/service/axiosConfig';
import './src/setup/disableSSRWarning';


const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setInitialRoute(authenticated ? 'Dashboard' : 'Login');
    } catch (error) {
      console.error('Auth check error:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <NativeBaseProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: color.primary }}>
            <StatusBar barStyle="light-content"  />
            {/* Add a loading screen here if needed */}
          </SafeAreaView>
        </NativeBaseProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NativeBaseProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: color.primary }}>
      <StatusBar barStyle="light-content"  />
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName={initialRoute}>
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
                name="Enrollment"
                component={Enrollment}
                options={{title: 'Enrollment', headerShown: false}}
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
              <Stack.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{title: 'Calendar', headerShown: false}}
              />
              <Stack.Screen
                name="CampusMap"
                component={CampusMapWeb}
                options={{title: 'Campus Map', headerShown: false}}
              />
              <Stack.Screen
                name="Proctor"
                component={ProctorScreen}
                options={{title: 'Proctor', headerShown: false}}
              />
              <Stack.Screen
                name="NewProctorReport"
                component={NewProctorReport}
                options={{title: 'New Report', headerShown: false}}
              />
              <Stack.Screen
                name="Payment"
                component={Payment}
                options={{title: 'Payment', headerShown: false}}
              />
              <Stack.Screen
                name="DirectPaymentWebView"
                component={DirectPaymentWebView}
                options={{title: 'Payment Gateway', headerShown: false}}
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
