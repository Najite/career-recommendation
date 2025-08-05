import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Users, BookOpen, Target, Star, ExternalLink, Loader2 } from 'lucide-react';
import { AssessmentAnswer, CareerRecommendation, SkillGap } from '../types';
import { aiService } from '../services/aiService';

interface ResultsProps {
  answers: AssessmentAnswer[];
  recommendations: CareerRecommendation[];
  onBack: () => void;
}

export const Results: React.FC<ResultsProps> = ({ answers, recommendations, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'careers' | 'skills' | 'learning'>('overview');
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  
  const topRecommendation = recommendations[0];
  
  // Load skill gap analysis when switching to skills tab
  const handleTabChange = async (tab: 'overview' | 'careers' | 'skills' | 'learning') => {
    setActiveTab(tab);
    
    if (tab === 'skills' && skillGaps.length === 0 && topRecommendation) {
      setIsLoadingSkills(true);
      try {
        // Extract user skills from assessment answers
        const skillsAnswer = answers.find(a => a.questionId === 'skills');
        const userSkills = Array.isArray(skillsAnswer?.answer) ? skillsAnswer.answer : [];
        
        const gaps = await aiService.generateSkillGapAnalysis(userSkills, topRecommendation);
        setSkillGaps(gaps);
      } catch (error) {
        console.error('Error loading skill gaps:', error);
      } finally {
        setIsLoadingSkills(false);
      }
    }
  };

  // Show loading state if no recommendations
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AI is Analyzing Your Profile</h2>
          <p className="text-gray-600">Creating personalized career recommendations just for you...</p>
        </div>
      </div>
    );
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Assessment</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Your Career Analysis</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Perfect Match</h2>
                  <p className="text-blue-100">Based on your assessment, here's your top career recommendation</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <Target className="h-8 w-8" />
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{topRecommendation.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-300" />
                    <span className="text-lg font-semibold">{topRecommendation.match}% Match</span>
                  </div>
                </div>
                <p className="text-blue-100 mb-4">{topRecommendation.description}</p>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold">{topRecommendation.averageSalary}</div>
                    <div className="text-blue-200 text-sm">Average Salary</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{topRecommendation.growthRate}</div>
                    <div className="text-blue-200 text-sm">Growth Rate</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold capitalize">{topRecommendation.jobMarketDemand}</div>
                    <div className="text-blue-200 text-sm">Market Demand</div>
                  </div>
                </div>
              </div>

              <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Explore Learning Path
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50">
              <div className="flex space-x-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Target },
                  { id: 'careers', label: 'Career Paths', icon: TrendingUp },
                  { id: 'skills', label: 'Skills Analysis', icon: Users },
                  { id: 'learning', label: 'Learning Path', icon: BookOpen }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as any)}
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

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Career Matches</h3>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
                <div className="text-sm text-gray-600">Recommended paths</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Skill Gaps</h3>
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{skillGaps.length}</div>
                <div className="text-sm text-gray-600">Areas to develop</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Avg. Salary</h3>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {topRecommendation?.averageSalary?.split(' - ')[0] || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">For top matches</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Growth Rate</h3>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {topRecommendation?.growthRate || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Industry average</div>
              </div>
            </div>
          </div>
        )}

        {/* Career Paths Tab */}
        {activeTab === 'careers' && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Career Paths</h2>
              <div className="space-y-6">
                {recommendations.map((career, index) => (
                  <div key={career.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{career.title}</h3>
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                            {career.match}% Match
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDemandColor(career.jobMarketDemand)}`}>
                            {career.jobMarketDemand} demand
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{career.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">{career.averageSalary}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-700">{career.growthRate} growth</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Required Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {career.requiredSkills.map(skill => (
                              <span key={skill} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      View Learning Path
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Analysis Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills Gap Analysis</h2>
              
              {isLoadingSkills ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your skill gaps...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {skillGaps.map((gap, index) => (
                    <div key={gap.skill} className="bg-white rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{gap.skill}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(gap.priority)}`}>
                          {gap.priority} priority
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Current Level</span>
                          <span>Target Level</span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gray-400 h-3 rounded-full"
                              style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                            />
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full absolute top-0"
                              style={{ width: `${(gap.requiredLevel / 5) * 100}%`, opacity: 0.3 }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Level {gap.currentLevel}</span>
                            <span>Level {gap.requiredLevel}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommended Resources:</h4>
                        <div className="space-y-2">
                          {gap.resources.map(resource => (
                            <div key={resource} className="flex items-center space-x-2 text-sm text-gray-600">
                              <BookOpen className="h-4 w-4" />
                              <span>{resource}</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learning Path Tab */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalized Learning Path</h2>
              
              <div className="space-y-8">
                {topRecommendation.learningPath.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step}</h3>
                        <p className="text-gray-600 mb-4">
                          Detailed description and learning objectives for this step in your career development journey.
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>📚 4-6 weeks</span>
                            <span>⭐ Beginner</span>
                            <span>🎯 Hands-on</span>
                          </div>
                          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300">
                            Start Learning
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};