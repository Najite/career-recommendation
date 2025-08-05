import React, { useState } from 'react';
import { useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Assessment } from './components/Assessment';
import { Results } from './components/Results';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { ResumeUpload } from './components/ResumeUpload';
import { AssessmentAnswer, CareerRecommendation } from './types';
import { authService } from './services/authService';
import { databaseService } from './services/databaseService';

type AppState = 'landing' | 'auth' | 'dashboard' | 'assessment' | 'resume-upload' | 'results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([]);
  const [careerRecommendations, setCareerRecommendations] = useState<CareerRecommendation[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const handleStartAssessment = () => {
    if (isAuthenticated) {
      setCurrentState('assessment');
    } else {
      setCurrentState('auth');
    }
  };

  const handleLogin = (userData: { id: string; name: string; email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Load user's recommendations after login
    loadUserRecommendations(userData.id);
  };

  const loadUserRecommendations = async (userId: string) => {
    try {
      const recommendations = await databaseService.getUserRecommendations(userId);
      setCareerRecommendations(recommendations);
      setCurrentState('dashboard');
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setCurrentState('dashboard'); // Still go to dashboard even if recommendations fail
    }
  };
  const handleStartFromDashboard = (type: 'assessment' | 'resume') => {
    if (type === 'assessment') {
      setCurrentState('assessment');
    } else {
      setCurrentState('resume-upload');
    }
  };

  const handleAssessmentComplete = async (answers: AssessmentAnswer[], recommendations: CareerRecommendation[]) => {
    setAssessmentAnswers(answers);
    
    // Always save to database first
    if (user) {
      try {
        console.log('Saving assessment and recommendations to database...');
        const assessmentId = await databaseService.saveAssessment(user.id, answers);
        const selectedCountries = answers.find(a => a.questionId === 'countries')?.answer || [];
        await databaseService.saveCareerRecommendations(
          user.id, 
          assessmentId, 
          recommendations, 
          Array.isArray(selectedCountries) ? selectedCountries : []
        );
        
        console.log('Successfully saved to database, fetching fresh recommendations...');
        // Fetch fresh recommendations from database
        const freshRecommendations = await databaseService.getUserRecommendations(user.id);
        setCareerRecommendations(freshRecommendations);
      } catch (error) {
        console.error('Failed to save assessment:', error);
        // Show error to user but still proceed with local recommendations
        alert('Failed to save recommendations to your profile. Please try again later.');
        setCareerRecommendations([]);
        return;
      }
    }
    
    setCurrentState('results');
  };

  const handleResumeComplete = async (resumeData: any, recommendations: CareerRecommendation[]) => {
    
    // Always save to database first
    if (user) {
      try {
        console.log('Saving resume analysis to database...');
        // Create a dummy assessment for resume-based recommendations
        const assessmentId = await databaseService.saveAssessment(user.id, []);
        await databaseService.saveCareerRecommendations(user.id, assessmentId, recommendations, []);
        
        console.log('Successfully saved resume analysis, fetching fresh recommendations...');
        // Fetch fresh recommendations from database
        const freshRecommendations = await databaseService.getUserRecommendations(user.id);
        setCareerRecommendations(freshRecommendations);
      } catch (error) {
        console.error('Failed to save resume analysis:', error);
        // Show error to user but still proceed with local recommendations
        alert('Failed to save recommendations to your profile. Please try again later.');
        setCareerRecommendations([]);
        return;
      }
    }
    
    setCurrentState('results');
  };

  const handleBackToLanding = () => {
    setCurrentState('landing');
    setAssessmentAnswers([]);
    setCareerRecommendations([]);
  };

  const handleBackToDashboard = () => {
    setCurrentState('dashboard');
  };

  const handleBackToAssessment = () => {
    setCurrentState('assessment');
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always reset state regardless of logout success/failure
      setUser(null);
      setIsAuthenticated(false);
      setCareerRecommendations([]);
      setAssessmentAnswers([]);
      setCurrentState('landing');
    }
  };

  return (
    <div className="App">
      {currentState === 'landing' && (
        <LandingPage onStartAssessment={handleStartAssessment} />
      )}
      
      {currentState === 'auth' && (
        <AuthPage 
          onLogin={handleLogin}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentState === 'dashboard' && (
        <Dashboard 
          user={user}
          careerRecommendations={careerRecommendations}
          onStartAssessment={() => handleStartFromDashboard('assessment')}
          onUploadResume={() => handleStartFromDashboard('resume')}
          onLogout={handleLogout}
          onViewRecommendations={() => setCurrentState('results')}
        />
      )}
      
      {currentState === 'assessment' && (
        <Assessment 
          onComplete={handleAssessmentComplete}
          onBack={isAuthenticated ? handleBackToDashboard : handleBackToLanding}
        />
      )}
      
      {currentState === 'resume-upload' && (
        <ResumeUpload 
          onComplete={handleResumeComplete}
          onBack={handleBackToDashboard}
        />
      )}
      
      {currentState === 'results' && (
        <Results 
          answers={assessmentAnswers}
          recommendations={careerRecommendations}
          onBack={handleBackToAssessment}
        />
      )}
    </div>
  );
}

export default App;