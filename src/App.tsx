import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import ProgressSteps from './components/ProgressSteps';
import DocumentUpload from './components/DocumentUpload';
import AnalysisProgress from './components/AnalysisProgress';
import CreditResults from './components/CreditResults';
import { DocumentFile, CreditRecommendation } from './types';

type AppStep = 'upload' | 'analysis' | 'results';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [recommendation, setRecommendation] = useState<CreditRecommendation | null>(null);

  const stepIndexMap: Record<AppStep, number> = {
    upload: 0,
    analysis: 1,
    results: 2
  };

  const handleDocumentsChange = (newDocuments: DocumentFile[]) => {
    setDocuments(newDocuments);
  };

  const handleStartAnalysis = async () => {
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (result: CreditRecommendation) => {
    setRecommendation(result);
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setCurrentStep('upload');
    setDocuments([]);
    setRecommendation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CreditAI</h1>
                <p className="text-sm text-gray-600">AI-Powered Credit Analysis</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Ollama AI
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressSteps currentStep={stepIndexMap[currentStep]} />

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 'upload' && (
            <DocumentUpload
              documents={documents}
              onDocumentsChange={handleDocumentsChange}
              onNext={handleStartAnalysis}
            />
          )}

          {currentStep === 'analysis' && (
            <AnalysisProgress
              documents={documents}
              onComplete={handleAnalysisComplete}
            />
          )}

          {currentStep === 'results' && recommendation && (
            <CreditResults
              recommendation={recommendation}
              documents={documents}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Secure AI-powered credit analysis using advanced machine learning
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your documents are processed securely and never stored permanently
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;