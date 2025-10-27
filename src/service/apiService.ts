import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { configureAxiosInstances } from './axiosConfig';

class ApiService {
  private api: AxiosInstance;
  private fileApi: AxiosInstance;

  constructor() {
    // Main API instance
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      },
    });

    // File API instance (if different)
    this.fileApi = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      },
    });

    configureAxiosInstances([this.api, this.fileApi]);
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post(API_CONFIG.ENDPOINTS.LOGIN, {
      registration_number: email,
      password: password,
    });
    return response.data;
  }

  async getStudentDetails() {
    const response = await this.api.get(API_CONFIG.ENDPOINTS.STUDENT_ME);
    return response.data;
  }

  // File methods
  async getFile(fileName: string) {
    const response = await this.fileApi.get(`${API_CONFIG.ENDPOINTS.GET_FILE}/${fileName}`, {
      maxBodyLength: Infinity,
    });
    return response.data;
  }

  // Generic request method
  async request(config: AxiosRequestConfig, useFileServer: boolean = false) {
    const apiInstance = useFileServer ? this.fileApi : this.api;
    const response = await apiInstance.request(config);
    return response.data;
  }

  // Simple helpers to align with payments service expectations
  async getClient<T = any>(url: string, config?: AxiosRequestConfig): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const data = await this.request({ method: 'GET', url, ...(config || {}) });
      return { success: true, data };
    } catch (error: any) {
      const raw = error?.response?.data ?? error?.message ?? 'Unknown error';
      const normalized = typeof raw === 'string' ? raw : (raw?.message || JSON.stringify(raw));
      return { success: false, error: normalized };
    }
  }

  async postClient<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const resData = await this.request({ method: 'POST', url, data, ...(config || {}) });
      return { success: true, data: resData };
    } catch (error: any) {
      const raw = error?.response?.data ?? error?.message ?? 'Unknown error';
      const normalized = typeof raw === 'string' ? raw : (raw?.message || JSON.stringify(raw));
      return { success: false, error: normalized };
    }
  }

  // Helper methods
  getImageUrl(fileName: string): string {
    if (!fileName) return '';
    if (fileName.startsWith('http')) return fileName;
    return buildUrl(`${API_CONFIG.ENDPOINTS.GET_FILE}/${fileName}`);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for creating custom instances
export { ApiService };
