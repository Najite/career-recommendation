import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, Brain } from 'lucide-react';
import { aiService } from '../services/aiService';
import { CareerRecommendation } from '../types';

interface ResumeUploadProps {
  onComplete: (resumeData: any, recommendations: CareerRecommendation[]) => void;
  onBack: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onComplete, onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadStatus('uploading');
    setError('');
    setIsAnalyzing(true);
    setAnalysisStep('Uploading resume...');

    // Simulate file upload
    setTimeout(async () => {
      try {
        setAnalysisStep('Reading resume content...');
        
        // Simulate file reading
        const fileContent = await readFileContent(file);
        
        setAnalysisStep('Parsing resume with AI...');
        
        // Use AI to parse resume content
        const resumeData = await aiService.parseResumeText(fileContent);
        
        setAnalysisStep('Generating career recommendations...');
        
        // Generate AI-powered career recommendations
        const recommendations = await aiService.analyzeResume(resumeData);
        
        setAnalysisStep('Finalizing analysis...');
        
        setTimeout(() => {
          setUploadStatus('success');
          setIsAnalyzing(false);
          onComplete(resumeData, recommendations);
        }, 1000);
        
      } catch (err) {
        setUploadStatus('error');
        setIsAnalyzing(false);
        setError('Failed to process resume. Please try again.');
      }
    }, 1500);
  }, [onComplete]);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h1>
          <p className="text-gray-600">
            Upload your resume and let our AI analyze it to provide personalized career recommendations
          </p>
        </div>

        {/* Upload Area */}
        {uploadStatus === 'idle' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your resume here or click to browse
              </h3>
              <p className="text-gray-600 mb-4">
                Supports PDF, DOC, DOCX files up to 10MB
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) onDrop(Array.from(files));
                }}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* File Selected */}
        {uploadedFile && uploadStatus !== 'success' && !isAnalyzing && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{uploadedFile.name}</h3>
                  <p className="text-sm text-gray-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {uploadStatus === 'uploading' && (
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              )}
            </div>
          </div>
        )}

        {/* AI Analysis Progress */}
        {isAnalyzing && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI is Analyzing Your Resume</h3>
            <p className="text-gray-600 mb-6">{analysisStep}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-sm text-gray-500">This may take a few moments...</p>
          </div>
        )}

        {/* Success State */}
        {uploadStatus === 'success' && !isAnalyzing && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Resume Processed Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your resume has been analyzed and career recommendations are ready.
            </p>
          </div>
        )}

        {/* Error State */}
        {uploadStatus === 'error' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Failed</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setUploadStatus('idle');
                setUploadedFile(null);
                setError('');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};