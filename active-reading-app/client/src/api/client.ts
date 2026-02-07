import axios from 'axios';
import { UploadResponse, AnalyzeResponse } from '../types';

const API_BASE = '/api';

export const api = {
  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  async analyzePaper(uploadId: string): Promise<AnalyzeResponse> {
    const response = await axios.post(`${API_BASE}/analyze`, { uploadId });
    return response.data;
  },

  async getAnalysis(uploadId: string): Promise<AnalyzeResponse> {
    const response = await axios.get(`${API_BASE}/analysis/${uploadId}`);
    return response.data;
  },

  async healthCheck(): Promise<{ status: string }> {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  }
};
