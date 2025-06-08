import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, BarChart3, PieChart, FileText } from 'lucide-react';
import { CreditRecommendation, DocumentFile } from '../types';

interface CreditResultsProps {
  recommendation: CreditRecommendation;
  documents: DocumentFile[];
  onRestart: () => void;
}

export default function CreditResults({ recommendation, documents, onRestart }: CreditResultsProps) {
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Credit Analysis Complete</h2>
        <p className="text-gray-600">
          Based on the analysis of {documents.length} documents, here's your personalized credit assessment.
        </p>
      </div>

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
                    {type.replace('-', ' ')}
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