import axios from 'axios';
import { getAsyncStoreData } from '../utils/async-storage';
import { API_CONFIG, buildUrl, buildFileUrl } from '../config/api';

export interface FileResponse {
  data: string;
}

export class FileService {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  public async getFilePath(fileName: string): Promise<FileResponse> {
    try {
      const token = await getAsyncStoreData('session');
      
      const response = await axios.get(buildUrl(`${API_CONFIG.ENDPOINTS.GET_FILE}/${fileName}`, this.baseURL), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        },
        maxBodyLength: Infinity,
      });

      return {
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  public async getFileUrl(fileName: string): Promise<string> {
    try {
      const result = await this.getFilePath(fileName);
      return result.data;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '';
    }
  }

  public getImageUrl(fileName: string): string {
    if (!fileName) return '';
    
    // If it's already a full URL, return as is
    if (fileName.startsWith('http')) {
      return fileName;
    }
    
    // Construct full URL using centralized config
    return buildFileUrl(fileName);
  }
}

// Create a default instance
const fileService = new FileService();

// Export convenience functions
export async function getFilePath(fileName: string): Promise<FileResponse> {
  return fileService.getFilePath(fileName);
}

export async function getFileUrl(fileName: string): Promise<string> {
  return fileService.getFileUrl(fileName);
}

export function getImageUrl(fileName: string): string {
  return fileService.getImageUrl(fileName);
}

export default fileService;
