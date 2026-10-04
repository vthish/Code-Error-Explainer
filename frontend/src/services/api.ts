/// <reference types="vite/client" />
import { AnalysisInput, AnalysisRecordDTO, HistoryListResponse, APIErrorResponse, User, AuthResponse } from '../types';

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://code-error-explainer-backend.onrender.com/api';
  }
  return '/api';
};



const API_BASE = getApiBaseUrl();


class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
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

  async loginWithGoogle(payload: { credential?: string; email?: string; name?: string; picture?: string; googleId?: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async loginDemo(email?: string, name?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  async chatWithError(context: any, messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<{ reply: string }> {
    return this.request<{ reply: string }>('/analyses/chat', {
      method: 'POST',
      body: JSON.stringify({ context, messages }),
    });
  }

  async getPublicAnalysis(id: string): Promise<AnalysisRecordDTO> {
    return this.request<AnalysisRecordDTO>(`/analyses/public/${id}`);
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }
}

export const api = new ApiService();

