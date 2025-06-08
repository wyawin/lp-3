export interface DocumentFile {
  id: string;
  file: File;
  type: DocumentType;
  status: 'pending' | 'uploading' | 'uploaded' | 'processing' | 'analyzed' | 'error';
  progress?: number;
  preview?: string;
  // Analysis results
  identifiedType?: DocumentType;
  extractedData?: string;
  analysisError?: string;
}

export type DocumentType = 
  | 'legal'
  | 'profit-loss'
  | 'balance-sheet'
  | 'bank-statement'
  | 'other';

export interface DocumentAnalysis {
  documentId: string;
  documentName: string;
  documentType: DocumentType;
  identifiedType?: DocumentType;
  extractedInfo: string;
  pageCount?: number;
  pageAnalyses?: Array<{
    page: number;
    analysis: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}

export interface CreditRecommendation {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendations: string[];
  riskFactors: string[];
  strengths: string[];
  summary: string;
  detailedAnalysis: {
    financialHealth: number;
    cashFlow: number;
    debtRatio: number;
    profitability: number;
  };
  documentAnalysis?: DocumentAnalysis[];
  metadata?: {
    totalDocuments: number;
    documentTypes: string[];
    analysisDate: string;
  };
}

export interface AnalysisStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  progress?: number;
}