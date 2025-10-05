import { logout } from './auth';
import { toast } from './utils';
import { resetToLogin } from '../navigation/navigationService';

let handlingSessionExpiry = false;

export async function handleSessionExpired(message?: string) {
  if (handlingSessionExpiry) {
    return;
  }

  handlingSessionExpiry = true;

  try {
    await logout();
  } catch (error) {
    console.error('Forced logout error:', error);
  } finally {
    toast('warning', 'Session expired', message || 'Please login again.');
    resetToLogin();
    handlingSessionExpiry = false;
  }
}
