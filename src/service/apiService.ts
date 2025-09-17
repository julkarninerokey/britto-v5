import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, buildUrl } from '../config/api';
import { getAsyncStoreData } from '../utils/async-storage';

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

    // Add request interceptor to include auth token
    this.setupInterceptors();
  }

  private setupInterceptors() {
    const addAuthToken = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      try {
        const token = await getAsyncStoreData('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error adding auth token:', error);
      }
      return config;
    };

    this.api.interceptors.request.use(addAuthToken);
    this.fileApi.interceptors.request.use(addAuthToken);
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
