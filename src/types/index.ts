export interface DocumentFile {
  id: string;
  file: File;
  type: DocumentType;
  status: 'pending' | 'uploading' | 'uploaded' | 'processing' | 'analyzed' | 'error';
  progress?: number;
  preview?: string;
}

export type DocumentType = 
  | 'legal'
  | 'profit-loss'
  | 'balance-sheet'
  | 'bank-statement'
  | 'other';

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
}

export interface AnalysisStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  progress?: number;
}