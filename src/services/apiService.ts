import axios, { AxiosResponse } from 'axios';
import { DocumentFile, CreditRecommendation } from '../types';

interface ProgressCallback {
  (data: {
    step: string;
    progress: number;
    message: string;
    result?: CreditRecommendation;
    error?: string;
  }): void;
}

export class ApiService {
  private static backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  
  // Configure axios instance with default settings
  private static axiosInstance = axios.create({
    baseURL: this.backendUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  static async uploadDocuments(documents: DocumentFile[]): Promise<any[]> {
    try {
      const formData = new FormData();
      
      // Add each document to the form data (no type needed as Ollama will identify)
      documents.forEach((doc) => {
        formData.append('documents', doc.file);
      });

      const response: AxiosResponse = await axios.post(
        `${this.backendUrl}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.files;
    } catch (error) {
      console.error('Error uploading documents:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to upload documents: ${error.response?.data?.error || error.message}`);
      }
      throw new Error(`Failed to upload documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async analyzeDocuments(
    documents: DocumentFile[], 
    progressCallback?: ProgressCallback
  ): Promise<CreditRecommendation> {
    try {
      // First upload the documents
      const uploadedFiles = await this.uploadDocuments(documents);
      
      // Then start the analysis with Server-Sent Events
      return await this.analyzeWithStreaming(uploadedFiles, progressCallback);
    } catch (error) {
      console.error('Error analyzing documents:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to analyze documents: ${error.response?.data?.error || error.message}`);
      }
      throw new Error(`Failed to analyze documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async analyzeWithStreaming(
    uploadedFiles: any[], 
    progressCallback?: ProgressCallback
  ): Promise<CreditRecommendation> {
    return new Promise((resolve, reject) => {
      // Use fetch for Server-Sent Events as axios doesn't handle SSE well
      fetch(`${this.backendUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: uploadedFiles }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.step === 'result') {
                    resolve(data.result);
                    return;
                  } else if (data.step === 'error') {
                    reject(new Error(data.error));
                    return;
                  }
                  
                  // Call progress callback if provided
                  if (progressCallback) {
                    progressCallback(data);
                  }
                  
                  // Handle progress updates
                  console.log(`Progress: ${data.step} - ${data.progress}% - ${data.message}`);
                } catch (e) {
                  console.warn('Failed to parse SSE data:', line);
                }
              }
            }

            readStream();
          }).catch(reject);
        };

        readStream();
      })
      .catch(reject);
    });
  }

  // Health check method to verify backend connection
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Get backend status including Ollama connection
  static async getBackendStatus(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error getting backend status:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Health check failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}