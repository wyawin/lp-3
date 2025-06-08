import React from 'react';
import { CheckCircle, Clock, Upload, Brain, FileText } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { icon: Upload, title: 'Upload Documents', description: 'Select and upload your financial documents' },
  { icon: Brain, title: 'AI Analysis', description: 'Our AI analyzes your documents' },
  { icon: FileText, title: 'Credit Report', description: 'View your personalized recommendations' }
];

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : isCurrent ? (
                    <Clock className="w-6 h-6 animate-pulse" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-4 transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
              <div className="mt-3 text-center max-w-32">
                <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}