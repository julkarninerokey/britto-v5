import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  StudentRegistration: undefined;
  Dashboard: undefined;
  [key: string]: any;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }
}
