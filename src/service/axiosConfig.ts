import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAsyncStoreData } from '../utils/async-storage';
import { handleSessionExpired } from './sessionManager';

const configuredInstances = new WeakSet<AxiosInstance>();

const INVALID_TOKEN_TEXT = 'invalid token';

function includesInvalidToken(message?: string) {
  return typeof message === 'string' && message.toLowerCase().includes(INVALID_TOKEN_TEXT);
}

async function attachAuthHeader(config: InternalAxiosRequestConfig) {
  if (!config.headers?.Authorization) {
    const token = await getAsyncStoreData('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}

async function handleError(error: AxiosError) {
  const status = error.response?.status;
  const message =
    (error.response?.data as { message?: string } | undefined)?.message ||
    error.message;

  if (status === 401 || includesInvalidToken(message)) {
    await handleSessionExpired(message);
  }

  return Promise.reject(error);
}

async function handleResponse(response: AxiosResponse) {
  const data = response.data as { message?: string } | undefined;
  if (includesInvalidToken(data?.message)) {
    await handleSessionExpired(data?.message);
    return Promise.reject(new Error(data?.message || 'Invalid token'));
  }
  return response;
}

function configureInstance(instance: AxiosInstance) {
  if (configuredInstances.has(instance)) {
    return;
  }

  instance.interceptors.request.use((config) => attachAuthHeader(config));
  instance.interceptors.response.use(handleResponse, (error) => handleError(error));
  configuredInstances.add(instance);
}

export function configureAxiosInstances(instances: AxiosInstance[] = [axios]) {
  instances.forEach((instance) => configureInstance(instance));
}

configureAxiosInstances();
