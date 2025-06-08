import React, { useEffect, useState } from 'react';
import { Brain, FileText, TrendingUp, Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AnalysisStep, DocumentFile, CreditRecommendation } from '../types';
import { ApiService } from '../services/apiService';

interface AnalysisProgressProps {
  documents: DocumentFile[];
  onComplete: (result: CreditRecommendation) => void;
}

const analysisSteps: AnalysisStep[] = [
  {
    id: 'document-processing',
    title: 'Processing Documents',
    description: 'Extracting and analyzing document content',
    status: 'pending'
  },
  {
    id: 'document-identification',
    title: 'Document Identification',
    description: 'AI identifying document types and structure',
    status: 'pending'
  },
  {
    id: 'financial-analysis',
    title: 'Financial Analysis',
    description: 'Evaluating financial health and cash flow',
    status: 'pending'
  },
  {
    id: 'credit-scoring',
    title: 'Credit Scoring',
    description: 'Calculating credit score and recommendations',
    status: 'pending'
  }
];

export default function AnalysisProgress({ documents, onComplete }: AnalysisProgressProps) {
  const [steps, setSteps] = useState(analysisSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Initializing analysis...');
  const [error, setError] = useState<string | null>(null);
  const [processedDocuments, setProcessedDocuments] = useState<string[]>([]);

  useEffect(() => {
    const startAnalysis = async () => {
      try {
        // Check backend health first
        const isHealthy = await ApiService.checkBackendHealth();
        if (!isHealthy) {
          throw new Error('Backend is not accessible. Please ensure the backend server is running.');
        }

        setCurrentMessage('Starting document analysis...');
        
        // Start the real analysis with progress tracking
        const result = await ApiService.analyzeDocuments(documents, (progressData) => {
          // Update progress based on backend messages
          setCurrentMessage(progressData.message || 'Processing...');
          setOverallProgress(progressData.progress || 0);
          
          // Update steps based on progress
          if (progressData.step === 'processing') {
            updateStepStatus(0, 'processing');
            if (progressData.progress >= 60) {
              updateStepStatus(0, 'completed');
              updateStepStatus(1, 'processing');
            }
          } else if (progressData.step === 'analysis') {
            updateStepStatus(1, 'completed');
            updateStepStatus(2, 'processing');
            if (progressData.progress >= 95) {
              updateStepStatus(2, 'completed');
              updateStepStatus(3, 'processing');
            }
          } else if (progressData.step === 'complete') {
            updateStepStatus(3, 'completed');
          }
          
          // Track processed documents
          if (progressData.message && progressData.message.includes('processing')) {
            const docName = progressData.message.split('processing ')[1]?.split('...')[0];
            if (docName && !processedDocuments.includes(docName)) {
              setProcessedDocuments(prev => [...prev, docName]);
            }
          }
        });
        
        onComplete(result);
      } catch (error) {
        console.error('Analysis failed:', error);
        setError(error instanceof Error ? error.message : 'Analysis failed');
        
        // Update steps to show error
        setSteps(prev => prev.map(step => ({
          ...step,
          status: 'error' as const
        })));
      }
    };

    const updateStepStatus = (stepIndex: number, status: AnalysisStep['status']) => {
      setSteps(prev => prev.map((step, index) => 
        index === stepIndex ? { ...step, status } : step
      ));
      setCurrentStepIndex(stepIndex);
    };

    startAnalysis();
  }, [documents, onComplete]);

  const getStepIcon = (step: AnalysisStep) => {
    switch (step.id) {
      case 'document-processing': return FileText;
      case 'document-identification': return Brain;
      case 'financial-analysis': return TrendingUp;
      case 'credit-scoring': return Shield;
      default: return Clock;
    }
  };

  const getStatusIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Troubleshooting:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Ensure the backend server is running on port 3001</li>
              <li>• Check that Ollama is installed and running</li>
              <li>• Verify the qwen2.5vl:7b model is available</li>
              <li>• Check network connectivity between frontend and backend</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray={`${overallProgress}, 100`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-600 mx-auto mb-1 animate-pulse" />
              <span className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Documents</h2>
        <p className="text-gray-600 mb-2">
          Our AI is processing your financial documents to generate personalized credit recommendations.
        </p>
        <p className="text-sm text-blue-600 font-medium">{currentMessage}</p>
      </div>

      <div className="space-y-4 mb-8">
        {steps.map((step, index) => {
          const StepIcon = getStepIcon(step);
          const StatusIcon = getStatusIcon(step.status);
          
          return (
            <div key={step.id} className={`
              bg-white rounded-lg border p-6 transition-all duration-300
              ${step.status === 'processing' ? 'border-blue-200 shadow-md' : 'border-gray-200'}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`
                    p-3 rounded-full transition-all duration-300
                    ${step.status === 'completed' ? 'bg-green-100' : 
                      step.status === 'processing' ? 'bg-blue-100' : 
                      step.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}
                  `}>
                    <StepIcon className={`
                      w-6 h-6 transition-all duration-300
                      ${step.status === 'completed' ? 'text-green-600' : 
                        step.status === 'processing' ? 'text-blue-600' : 
                        step.status === 'error' ? 'text-red-600' : 'text-gray-400'}
                    `} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${getStatusColor(step.status)}
                  `}>
                    <StatusIcon className={`
                      w-4 h-4 mr-2 
                      ${step.status === 'processing' ? 'animate-spin' : ''}
                    `} />
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Processing Status */}
      {processedDocuments.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Documents Being Processed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {documents.map((doc, index) => (
              <div key={doc.id} className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  processedDocuments.some(name => doc.file.name.includes(name)) 
                    ? 'bg-green-500' 
                    : index <= processedDocuments.length 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-gray-300'
                }`} />
                <span className="text-blue-700 truncate">{doc.file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">AI Processing</h3>
            <p className="text-sm text-blue-700">
              Analyzing {documents.length} documents using Ollama qwen2.5vl:7b model
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}