import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { DocumentFile } from '../types';

interface DocumentUploadProps {
  documents: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  onNext: () => void;
}

export default function DocumentUpload({ documents, onDocumentsChange, onNext }: DocumentUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocuments = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: 'other' as const, // Default type, will be identified by Ollama
      status: 'uploaded' as const,
      progress: 100
    }));
    
    onDocumentsChange([...documents, ...newDocuments]);
  }, [documents, onDocumentsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'xlsx':
      case 'xls': return '📊';
      case 'csv': return '📈';
      case 'doc':
      case 'docx': return '📝';
      default: return '📄';
    }
  };

  const getStatusColor = (status: DocumentFile['status']) => {
    switch (status) {
      case 'uploaded': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Financial Documents</h2>
        <p className="text-gray-600">
          Upload documents such as legal papers, financial statements, and bank records. Our AI will automatically identify and analyze each document type.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the files here...</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Supports PDF, Excel, Word, and CSV files
                </p>
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Supported Documents:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Legal documents (contracts, agreements)</li>
                    <li>• Profit & Loss statements</li>
                    <li>• Balance sheets</li>
                    <li>• Bank statements</li>
                    <li>• Other financial documents</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    ✨ AI will automatically identify document types
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded Documents ({documents.length})
          </h3>
          
          {documents.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload documents to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(doc.file.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {doc.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          Will be auto-identified by AI
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status === 'uploaded' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {doc.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {documents.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Analyze Documents ({documents.length})
          </button>
        </div>
      )}
    </div>
  );
}