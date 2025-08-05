export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentRole?: string;
  experience: number;
  education: string;
  skills: string[];
  interests: string[];
  workStyle: string[];
  careerGoals: string[];
  selectedCountries: string[];
  careerRecommendations: CareerRecommendation[];
  lastAssessmentDate?: string;
  assessmentAnswers?: AssessmentAnswer[];
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
  }[];
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
  }[];
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[];
}

export interface CareerRecommendation {
  id: string;
  title: string;
  match: number;
  description: string;
  averageSalary: string;
  growthRate: string;
  requiredSkills: string[];
  learningPath: string[];
  jobMarketDemand: 'high' | 'medium' | 'low';
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  resources: string[];
}