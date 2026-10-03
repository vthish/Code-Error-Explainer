import { AnalysisInput, AnalysisRecordDTO, HistoryListResponse, APIErrorResponse } from '../types';

const API_BASE = '/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorMessage = 'An unexpected API error occurred.';
      try {
        const errJson: APIErrorResponse = await res.json();
        if (errJson.error?.message) {
          errorMessage = errJson.error.message;
        }
      } catch {
        errorMessage = `HTTP Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  }

  async checkHealth(): Promise<{ status: string; environment: string; ai_provider: string }> {
    return this.request<{ status: string; environment: string; ai_provider: string }>('/health');
  }

  async analyzeError(input: AnalysisInput): Promise<AnalysisRecordDTO> {
    return this.request<AnalysisRecordDTO>('/analyze', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getAnalyses(limit = 20, offset = 0): Promise<HistoryListResponse> {
    return this.request<HistoryListResponse>(`/analyses?limit=${limit}&offset=${offset}`);
  }

  async getAnalysisById(id: string): Promise<AnalysisRecordDTO> {
    return this.request<AnalysisRecordDTO>(`/analyses/${id}`);
  }

  async deleteAnalysis(id: string): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>(`/analyses/${id}`, {
      method: 'DELETE',
    });
  }

  async reanalyze(id: string): Promise<AnalysisRecordDTO> {
    return this.request<AnalysisRecordDTO>(`/analyses/${id}/reanalyze`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
