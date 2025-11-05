import React, { useState } from 'react';
import { ArrowLeft, User, Target, Upload, BookOpen, TrendingUp, Award, Settings, LogOut, Brain } from 'lucide-react';
import { CareerRecommendation } from '../types';

interface DashboardProps {
  user: { id: string; name: string; email: string } | null;
  careerRecommendations: CareerRecommendation[];
  onStartAssessment: () => void;
  onUploadResume: () => void;
  onLogout: () => void;
  onViewRecommendations: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  careerRecommendations,
  onStartAssessment, 
  onUploadResume, 
  onLogout,
  onViewRecommendations 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'progress' | 'profile'>('overview');

  const completionPercentage = 65; // Mock completion percentage
  const hasRecommendations = careerRecommendations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CareerAI
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-blue-100 mb-6">
                Continue your career discovery journey. You're {completionPercentage}% complete!
              </p>
              <div className="w-64 bg-white/20 rounded-full h-3 mb-6">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <div className="bg-white/20 rounded-full p-6">
              <Target className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Recommended</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Take Career Assessment</h3>
            <p className="text-gray-600 mb-4">
              Complete our comprehensive assessment to get personalized career recommendations.
            </p>
            <button
              onClick={onStartAssessment}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Assessment
            </button>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
            {/* <div className="flex items-center justify-between mb-4"> */}
              {/* <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <Upload className="h-6 w-6 text-green-600" />
              </div> */}
              {/* <span className="text-sm text-gray-500">Quick Start</span> */}
            {/* </div> */}
            {/* <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Resume</h3> */}
            {/* <p className="text-gray-600 mb-4"> */}
              {/* Upload your resume for instant AI-powered career analysis and recommendations. */}
            {/* </p> */}
            {/* <button */}
              {/* onClick={onUploadResume} */}
              {/* className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105" */}
            {/* > */}
              {/* Upload Resume */}
            {/* </button> */}
          {/* </div> */}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
              { id: 'progress', label: 'Progress', icon: Award },
              { id: 'profile', label: 'Profile', icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Assessments</h4>
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Recommendations</h4>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-sm text-gray-600">Career paths</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Learning</h4>
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-sm text-gray-600">Resources saved</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Career Recommendations</h3>
              
              {hasRecommendations ? (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">{careerRecommendations.length} Career Recommendations Available</h4>
                        <p className="text-blue-700 text-sm">Personalized for your selected countries with local market data</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {careerRecommendations.slice(0, 4).map((career, index) => (
                      <div key={career.id} className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{career.title}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {career.match}% Match
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{career.description.substring(0, 100)}...</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-green-600">{career.averageSalary}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            career.jobMarketDemand === 'high' ? 'bg-green-100 text-green-800' :
                            career.jobMarketDemand === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {career.jobMarketDemand} demand
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={onViewRecommendations}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                    >
                      View All Recommendations
                    </button>
                    <button
                      onClick={onStartAssessment}
                      className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
                    >
                      Retake Assessment
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Career Recommendations Yet</h4>
                    <p className="text-gray-600 mb-6">
                      Complete an assessment or upload your resume to get personalized career recommendations with local market data and currency-specific salaries.
                  </p>
                  <div className="flex space-x-4">
                      <div className="flex justify-center space-x-4">
                    <button
                      onClick={onStartAssessment}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                    >
                      Take Assessment
                    </button>
                    <button
                      onClick={onUploadResume}
                      className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
                    >
                      Upload Resume
                    </button>
                  </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Profile Completion</h4>
                    <span className="text-blue-600 font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Next Steps</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">Complete career assessment</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-500">Upload resume for analysis</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-500">Explore learning resources</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Account Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Email Notifications</h5>
                        <p className="text-sm text-gray-600">Receive updates about your career progress</p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                        Enabled
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Privacy Settings</h5>
                        <p className="text-sm text-gray-600">Control who can see your profile</p>
                      </div>
                      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
                        Private
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
