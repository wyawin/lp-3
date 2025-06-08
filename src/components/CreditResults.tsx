import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, BarChart3, FileText, ChevronDown, ChevronUp, Eye, FileCheck } from 'lucide-react';
import { CreditRecommendation, DocumentFile, DocumentAnalysis } from '../types';

interface CreditResultsProps {
  recommendation: CreditRecommendation;
  documents: DocumentFile[];
  onRestart: () => void;
}

export default function CreditResults({ recommendation, documents, onRestart }: CreditResultsProps) {
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getRatingBadgeColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'legal': return '⚖️';
      case 'profit-loss': return '📊';
      case 'balance-sheet': return '📈';
      case 'bank-statement': return '🏦';
      default: return '📄';
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'legal': return 'Legal Document';
      case 'profit-loss': return 'Profit & Loss Statement';
      case 'balance-sheet': return 'Balance Sheet';
      case 'bank-statement': return 'Bank Statement';
      default: return 'Other Document';
    }
  };

  const toggleDocumentExpansion = (docId: string) => {
    setExpandedDocument(expandedDocument === docId ? null : docId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Credit Analysis Complete</h2>
        <p className="text-gray-600">
          Based on the analysis of {documents.length} documents, here's your personalized credit assessment.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Credit Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'documents'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Document Analysis
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Credit Score Overview */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Credit Score</h3>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRatingBadgeColor(recommendation.rating)}`}>
                  {recommendation.rating}
                </span>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="4"
                      strokeDasharray={`${recommendation.score}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={`stop-color-${getScoreGradient(recommendation.score).split('-')[1]}-500`} />
                        <stop offset="100%" className={`stop-color-${getScoreGradient(recommendation.score).split('-')[3]}-600`} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className={`text-4xl font-bold ${getScoreColor(recommendation.score)}`}>
                        {recommendation.score}
                      </span>
                      <div className="text-gray-500 text-sm">out of 100</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {recommendation.summary}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Financial Metrics
                </h4>
                <div className="space-y-3">
                  {Object.entries(recommendation.detailedAnalysis).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-gray-600">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(value)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Documents Analyzed
                </h4>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">{documents.length} documents processed</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(documents.map(d => d.type))).map(type => (
                      <span key={type} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {getDocumentTypeName(type)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Strengths
              </h3>
              <ul className="space-y-3">
                {recommendation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Risk Factors
              </h3>
              <ul className="space-y-3">
                {recommendation.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Recommendations for Improvement
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendation.recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileCheck className="w-6 h-6 mr-2 text-blue-600" />
              Document Analysis Results
            </h3>
            
            {recommendation.documentAnalysis && recommendation.documentAnalysis.length > 0 ? (
              <div className="space-y-4">
                {recommendation.documentAnalysis.map((analysis, index) => (
                  <div key={analysis.documentId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleDocumentExpansion(analysis.documentId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getDocumentTypeIcon(analysis.identifiedType || analysis.documentType)}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">{analysis.documentName}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Type: {getDocumentTypeName(analysis.identifiedType || analysis.documentType)}</span>
                              {analysis.pageCount && (
                                <span>Pages: {analysis.pageCount}</span>
                              )}
                              {analysis.error && (
                                <span className="text-red-600 font-medium">Analysis Error</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {analysis.identifiedType && analysis.identifiedType !== 'other' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Auto-identified
                            </span>
                          )}
                          {expandedDocument === analysis.documentId ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedDocument === analysis.documentId && (
                      <div className="p-6 border-t border-gray-200">
                        {analysis.error ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-2">Analysis Error</h5>
                            <p className="text-red-700 text-sm">{analysis.error}</p>
                          </div>
                        ) : (
                          <>
                            <h5 className="font-medium text-gray-900 mb-3">Extracted Information</h5>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                {analysis.extractedInfo}
                              </pre>
                            </div>
                            
                            {analysis.pageAnalyses && analysis.pageAnalyses.length > 0 && (
                              <>
                                <h5 className="font-medium text-gray-900 mb-3">Page-by-Page Analysis</h5>
                                <div className="space-y-3">
                                  {analysis.pageAnalyses.map((pageAnalysis, pageIndex) => (
                                    <div key={pageIndex} className="border border-gray-200 rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="font-medium text-gray-800">Page {pageAnalysis.page}</h6>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          pageAnalysis.success 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {pageAnalysis.success ? 'Success' : 'Error'}
                                        </span>
                                      </div>
                                      {pageAnalysis.success ? (
                                        <p className="text-sm text-gray-700">{pageAnalysis.analysis}</p>
                                      ) : (
                                        <p className="text-sm text-red-600">{pageAnalysis.error}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No detailed document analysis available</p>
                <p className="text-sm text-gray-400">The analysis may have been processed in summary mode</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Analyze New Documents
        </button>
      </div>
    </div>
  );
}