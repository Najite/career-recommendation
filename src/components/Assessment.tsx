import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Loader2, ChevronDown } from 'lucide-react';
import { assessmentQuestions } from '../data/questions';
import { AssessmentAnswer } from '../types';
import { aiService } from '../services/aiService';
import { supabase } from '../lib/supabase';
import { databaseService } from '../services/databaseService';

interface AssessmentProps {
  onComplete: (answers: AssessmentAnswer[], recommendations: any[]) => void;
  onBack: () => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  const handleOptionSelect = (option: string) => {
    if (question.type === 'multiselect' || (question.type === 'dropdown' && question.multiselect)) {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    } else if (question.type === 'dropdown') {
      setSelectedOptions([option]);
      setIsDropdownOpen(false);
    } else {
      setSelectedOptions([option]);
    }
  };

const handleNext = async () => {
  const answer: AssessmentAnswer = {
  questionId: question.id,
  answer:
    question.id === 'country'
      ? (Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions])
      : (question.type === 'multiselect' ? selectedOptions : selectedOptions[0])
};

  const updatedAnswers = [...answers.filter(a => a.questionId !== question.id), answer];
  setAnswers(updatedAnswers);

  if (currentQuestion < assessmentQuestions.length - 1) {
    setCurrentQuestion(prev => prev + 1);
    setSelectedOptions([]);
  } else {
    setIsProcessing(true);
    try {
      // Always extract selected countries from the current answer if this is the country question
      let selectedCountries: string[] = [];
      if (question.id === 'country') {
        selectedCountries = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
      } else {
        const countryAnswer = updatedAnswers.find(a => a.questionId === 'country');
        selectedCountries = countryAnswer
          ? Array.isArray(countryAnswer.answer)
            ? countryAnswer.answer
            : [countryAnswer.answer]
          : [];
      }

      // filepath: c:\Users\DEV\Downloads\recommendation\project\src\components\Assessment.tsx
console.log('question.id:', question.id, 'answer:', answer, 'selectedOptions:', selectedOptions, 'updatedAnswers:', updatedAnswers);

      // Check if at least one country is selected
      if (selectedCountries.length === 0 || !selectedCountries[0]) {
        alert('Please select at least one country before submitting the assessment.');
        setIsProcessing(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const assessmentId = await databaseService.saveAssessment(user.id, updatedAnswers);
      const recommendations = await aiService.generateCareerRecommendations(updatedAnswers);

      await databaseService.saveCareerRecommendations(
        user.id,
        assessmentId,
        recommendations,
        selectedCountries
      );
      onComplete(updatedAnswers, recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Failed to generate career recommendations. Please check your internet connection and try again.');
      setIsProcessing(false);
    }
  }
};

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      const prevAnswer = answers.find(a => a.questionId === assessmentQuestions[currentQuestion - 1].id);
      if (prevAnswer) {
        setSelectedOptions(Array.isArray(prevAnswer.answer) ? prevAnswer.answer : [prevAnswer.answer]);
      } else {
        setSelectedOptions([]);
      }
    }
  };

  const canProceed = selectedOptions.length > 0;
  const isLastQuestion = currentQuestion === assessmentQuestions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentQuestion + 1} of {assessmentQuestions.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {question.question}
            </h2>
            {question.type === 'multiselect' && (
              <p className="text-gray-600">Select all that apply</p>
            )}
          </div>

          {question.type === 'dropdown' ? (
            <div className="mb-8">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
                >
                  <span className="text-gray-800">
                    {selectedOptions.length > 0 
                      ? `${selectedOptions.length} countries selected`
                      : 'Select countries...'
                    }
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {question.options.map((option, index) => {
                      const isSelected = selectedOptions.includes(option);
                      return (
                        <button
                          key={index}
                          onClick={() => handleOptionSelect(option)}
                          className={`w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <span className="text-gray-800">{option}</span>
                          {isSelected && (
                            <div className="bg-blue-500 rounded-full p-1">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {selectedOptions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected countries:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOptions.map(country => (
                      <span
                        key={country}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center space-x-2"
                      >
                        <span>{country}</span>
                        <button
                          onClick={() => handleOptionSelect(country)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {question.options.map((option, index) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">{option}</span>
                      {isSelected && (
                        <div className="bg-blue-500 rounded-full p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-200 ${
                currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed || isProcessing}
              className={`flex items-center space-x-2 px-8 py-3 rounded-full font-medium transition-all duration-200 ${
                canProceed && !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>{isLastQuestion ? 'Complete Assessment' : 'Next'}</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};