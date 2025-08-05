import { countries } from 'countries-list';

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries)
  .map(([code, country]) => ({
    code,
    name: country.name,
    currency: country.currency
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(country => country.name);

export const assessmentQuestions = [
  {
    id: 'experience',
    type: 'select',
    question: 'What is your current professional experience level?',
    options: [
      'Entry Level (0-2 years)',
      'Mid Level (3-5 years)',
      'Senior Level (6-10 years)',
      'Executive Level (10+ years)',
      'Student/Fresh Graduate'
    ]
  },
  {
    id: 'education',
    type: 'select',
    question: 'What is your highest level of education?',
    options: [
      'High School',
      'Associate Degree',
      'Bachelor\'s Degree',
      'Master\'s Degree',
      'PhD/Doctorate',
      'Professional Certification'
    ]
  },
  {
    id: 'skills',
    type: 'multiselect',
    question: 'Which skills do you currently possess? (Select all that apply)',
    options: [
      'Programming/Software Development',
      'Data Analysis',
      'Project Management',
      'Digital Marketing',
      'Graphic Design',
      'Sales',
      'Customer Service',
      'Financial Analysis',
      'Content Writing',
      'Leadership',
      'Problem Solving',
      'Communication'
    ]
  },
  {
    id: 'interests',
    type: 'multiselect',
    question: 'What areas interest you most? (Select all that apply)',
    options: [
      'Technology & Innovation',
      'Healthcare & Medicine',
      'Finance & Investment',
      'Creative Arts & Design',
      'Education & Training',
      'Environmental Sustainability',
      'Business & Entrepreneurship',
      'Social Impact & Non-profit',
      'Research & Development',
      'Media & Communications'
    ]
  },
  {
    id: 'workStyle',
    type: 'multiselect',
    question: 'What work environment do you prefer?',
    options: [
      'Remote Work',
      'Hybrid Work',
      'Office-based',
      'Travel Opportunities',
      'Flexible Hours',
      'Team Collaboration',
      'Independent Work',
      'Fast-paced Environment',
      'Structured Environment',
      'Creative Freedom'
    ]
  },
  {
    id: 'goals',
    type: 'multiselect',
    question: 'What are your primary career goals?',
    options: [
      'Higher Salary',
      'Work-Life Balance',
      'Career Advancement',
      'Skill Development',
      'Job Security',
      'Creative Fulfillment',
      'Social Impact',
      'Entrepreneurship',
      'Industry Recognition',
      'Global Opportunities'
    ]
  },

  
  {
    id: 'country',
    type: 'dropdown',
    question: 'Which countries are you interested in working in?',
    options: countryOptions,
    multiselect: true
  }
];