import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnalysisInput, AnalysisRecordDTO } from '../types';
import { api } from '../services/api';

interface AnalysisContextType {
  record: AnalysisRecordDTO | null;
  isLoading: boolean;
  errorMessage: string;
  lastInput: AnalysisInput | null;
  analyzeError: (input: AnalysisInput) => Promise<void>;
  cancelAnalysis: () => void;
  clearAnalysis: () => void;
  setRecord: React.Dispatch<React.SetStateAction<AnalysisRecordDTO | null>>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [record, setRecord] = useState<AnalysisRecordDTO | null>(() => {
    try {
      const saved = sessionStorage.getItem('draft_analysis_record');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastInput, setLastInput] = useState<AnalysisInput | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      if (record) {
        sessionStorage.setItem('draft_analysis_record', JSON.stringify(record));
      } else {
        sessionStorage.removeItem('draft_analysis_record');
      }
    } catch {}
  }, [record]);

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const clearAnalysis = () => {
    cancelAnalysis();
    setRecord(null);
    setErrorMessage('');
    setLastInput(null);
    try {
      sessionStorage.removeItem('draft_analysis_record');
    } catch {}
  };

  useEffect(() => {
    const handleClearEvent = () => {
      clearAnalysis();
    };
    window.addEventListener('clear-analyzer', handleClearEvent);
    return () => {
      window.removeEventListener('clear-analyzer', handleClearEvent);
    };
  }, []);

  const analyzeError = async (input: AnalysisInput) => {
    // Cancel any previous in-flight analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage('');
    setRecord(null);
    setLastInput(input);

    try {
      const data = await api.analyzeError(input, controller.signal);
      setRecord(data);
      // Invalidate history query cache so newly completed analysis appears in History
      queryClient.invalidateQueries({ queryKey: ['history'] });
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : 'Failed to analyze error.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        record,
        isLoading,
        errorMessage,
        lastInput,
        analyzeError,
        cancelAnalysis,
        clearAnalysis,
        setRecord,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
