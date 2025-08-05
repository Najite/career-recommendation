import axios from 'axios';
import { countries } from 'countries-list';
import { AssessmentAnswer, CareerRecommendation, SkillGap } from '../types';
import { databaseService } from './databaseService';

const MOONSHOT_API_KEY = import.meta.env.VITE_MOONSHOT_API_KEY;
const MOONSHOT_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface MoonshotResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class AIService {
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async callMoonshotAPI(prompt: string): Promise<string> {
    // Check cache first
    const cacheKey = this.hashString(prompt);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }

    if (!MOONSHOT_API_KEY) {
      throw new Error('Moonshot AI API key is not configured. Please check your environment variables.');
    }

    try {
      const response = await axios.post<MoonshotResponse>(
        MOONSHOT_API_URL,
        {
          model: 'moonshotai/kimi-k2:free',
          messages: [
            {
              role: 'system',
              content: 'You are an expert career counselor and AI assistant. Provide concise, actionable career advice. Always return valid JSON only, no additional text or formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response format from Moonshot AI API');
      }

      const content = response.data.choices[0].message.content;
      
      // Cache the response
      this.cache.set(cacheKey, {
        response: content,
        timestamp: Date.now()
      });

      return content;
    } catch (error) {
      console.error('Moonshot AI API Error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your Moonshot AI API key configuration.');
        } else if (error.response?.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (error.response?.status >= 500) {
          throw new Error('Moonshot AI service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`API request failed: ${error.response?.statusText || error.message}`);
        }
      }
      
      throw new Error('Failed to connect to AI service. Please check your internet connection and try again.');
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async generateCareerRecommendations(answers: AssessmentAnswer[]): Promise<CareerRecommendation[]> {
    const assessmentData = this.formatAssessmentData(answers);
    const selectedCountries = this.extractSelectedCountries(answers);
    
    if (selectedCountries.length === 0) {
      throw new Error('Please select at least one country for career recommendations.');
    }
    
    const countryMarketData = this.getDetailedCountryData(selectedCountries);
    
    const prompt = `You are a professional career counselor with access to real-time job market data. Analyze this career assessment for someone interested in working in these specific countries: ${selectedCountries.join(', ')}.

CRITICAL REQUIREMENTS:
1. ONLY recommend careers that actually exist and are in demand in the selected countries
2. Use EXACT local currency for each country (no approximations)
3. Base salary ranges on REAL market data for these specific countries
4. Consider visa/work permit requirements for international candidates
5. Factor in local job market conditions, competition, and growth prospects

${assessmentData}

COUNTRY-SPECIFIC MARKET DATA:
${countryMarketData.map(country => `
${country.name}:
- Currency: ${country.currency} (${country.symbol})
- Major Industries: ${country.majorIndustries.join(', ')}
- Job Market: ${country.jobMarketCondition}
- Work Visa Required: ${country.workVisaRequired}
- Language Requirements: ${country.languages.join(', ')}
- Cost of Living Index: ${country.costOfLivingIndex}
`).join('\n')}

SALARY REQUIREMENTS - Use these EXACT formats:
${countryMarketData.map(c => `- ${c.name}: ${c.symbol}XX,XXX - ${c.symbol}XXX,XXX ${c.currency}`).join('\n')}

IMPORTANT: 
- Only recommend careers with genuine opportunities in the selected countries
- Use realistic salary ranges based on actual market conditions
- Consider the user's experience level and education
- Factor in language barriers and cultural fit
- Include visa/work permit considerations

Return exactly 5 career recommendations as JSON array only (no additional text):
[{"id":"1","title":"Specific Job Title","match":85,"description":"Realistic description for ${selectedCountries.join('/')} market","averageSalary":"${countryMarketData[0]?.symbol}XX,XXX - ${countryMarketData[0]?.symbol}XXX,XXX ${countryMarketData[0]?.currency}","growthRate":"Realistic % based on market data","requiredSkills":["actual required skills"],"learningPath":["realistic learning steps"],"jobMarketDemand":"high/medium/low based on real data"}]
    `;

    try {
      const response = await this.callMoonshotAPI(prompt);
      const cleanedResponse = this.cleanJSONResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error parsing career recommendations:', error);
      throw new Error('Failed to generate personalized career recommendations. Please try again.');
    }
  }

  async analyzeResume(resumeData: any): Promise<CareerRecommendation[]> {
    const prompt = `Analyze this resume and return exactly 5 career recommendations as JSON array.
    
    IMPORTANT: Use USD currency for salary ranges since no specific countries were selected.

Name: ${resumeData.name}
Experience: ${resumeData.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ')}
Skills: ${resumeData.skills.join(', ')}
Education: ${resumeData.education.map(edu => `${edu.degree} in ${edu.field}`).join(', ')}

Provide salary ranges in USD format: $XX,XXX - $XXX,XXX USD

Return JSON array only:
[{"id":"1","title":"Career Title","match":85,"description":"Brief description","averageSalary":"$80,000 - $120,000 USD","growthRate":"+15%","requiredSkills":["skill1","skill2"],"learningPath":["step1","step2"],"jobMarketDemand":"high"}]
    `;

    try {
      const response = await this.callMoonshotAPI(prompt);
      const cleanedResponse = this.cleanJSONResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error parsing resume analysis:', error);
      throw new Error('Failed to generate personalized career recommendations from resume. Please try again.');
    }
  }

  async generateSkillGapAnalysis(userSkills: string[], targetCareer: CareerRecommendation): Promise<SkillGap[]> {
    const prompt = `
Analyze the skill gap between the user's current skills and the requirements for their target career.

User's Current Skills: ${userSkills.join(', ')}

Target Career: ${targetCareer.title}
Required Skills: ${targetCareer.requiredSkills.join(', ')}
Career Description: ${targetCareer.description}

Please return a JSON array of skill gaps with the following structure:
{
  "skill": "Skill Name",
  "currentLevel": 2,
  "requiredLevel": 4,
  "priority": "high" | "medium" | "low",
  "resources": ["resource1", "resource2", "resource3"]
}

Consider:
- Skills the user already has vs. what's required
- Priority based on importance for the role
- Realistic learning resources and courses
- Current skill level (1-5 scale)
- Required skill level for the target role

Return only the JSON array, no additional text.
    `;

    try {
      const response = await this.callMoonshotAPI(prompt);
      const cleanedResponse = this.cleanJSONResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error parsing skill gap analysis:', error);
      throw new Error('Failed to generate skill gap analysis');
    }
  }

  async parseResumeText(resumeText: string): Promise<ResumeData> {
    const prompt = `Extract structured data from this resume text as JSON:

${resumeText}

Return JSON only:
{"name":"","email":"","phone":"","summary":"","experience":[{"title":"","company":"","duration":"","description":""}],"skills":[],"education":[{"degree":"","field":"","institution":"","year":""}]}
    `;

    try {
      const response = await this.callMoonshotAPI(prompt);
      const cleanedResponse = this.cleanJSONResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error parsing resume text:', error);
      throw new Error('Failed to parse resume');
    }
  }

  private extractSelectedCountries(answers: AssessmentAnswer[]): string[] {
    const countriesAnswer = answers.find(a => a.questionId === 'country');
    if (countriesAnswer && Array.isArray(countriesAnswer.answer)) {
      return countriesAnswer.answer;
    }
    return [];
  }

  private getDetailedCountryData(selectedCountries: string[]): Array<{
    name: string;
    currency: string;
    symbol: string;
    majorIndustries: string[];
    jobMarketCondition: string;
    workVisaRequired: boolean;
    languages: string[];
    costOfLivingIndex: string;
  }> {
    return selectedCountries.map(countryName => {
      // Find the country code by name
      const countryEntry = Object.entries(countries).find(([code, country]) => 
        country.name === countryName
      );
      
      if (countryEntry) {
        const [code, countryData] = countryEntry;
        const detailedData = this.getCountryMarketData(countryName, code);
        return {
          name: countryName,
          currency: countryData.currency,
          symbol: this.getCurrencySymbol(countryData.currency),
          ...detailedData
        };
      }
      
      // Fallback for unknown countries
      return {
        name: countryName,
        currency: 'USD',
        symbol: '$',
        majorIndustries: ['Technology', 'Finance', 'Healthcare'],
        jobMarketCondition: 'Competitive',
        workVisaRequired: true,
        languages: ['English'],
        costOfLivingIndex: 'Medium'
      };
    });
  }

  private getCountryMarketData(countryName: string, countryCode: string) {
    // Real market data for major countries
    const marketData: Record<string, any> = {
      'United States': {
        majorIndustries: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Entertainment'],
        jobMarketCondition: 'Strong with high competition in tech hubs',
        workVisaRequired: true,
        languages: ['English'],
        costOfLivingIndex: 'High (varies by state)'
      },
      'United Kingdom': {
        majorIndustries: ['Financial Services', 'Technology', 'Creative Industries', 'Healthcare', 'Manufacturing'],
        jobMarketCondition: 'Stable with Brexit-related changes',
        workVisaRequired: true,
        languages: ['English'],
        costOfLivingIndex: 'High (especially London)'
      },
      'Germany': {
        majorIndustries: ['Automotive', 'Manufacturing', 'Technology', 'Engineering', 'Renewable Energy'],
        jobMarketCondition: 'Strong demand for skilled workers',
        workVisaRequired: true,
        languages: ['German', 'English in tech'],
        costOfLivingIndex: 'Medium to High'
      },
      'Canada': {
        majorIndustries: ['Technology', 'Natural Resources', 'Healthcare', 'Finance', 'Manufacturing'],
        jobMarketCondition: 'Growing with immigration-friendly policies',
        workVisaRequired: true,
        languages: ['English', 'French'],
        costOfLivingIndex: 'Medium to High'
      },
      'Australia': {
        majorIndustries: ['Mining', 'Technology', 'Healthcare', 'Education', 'Tourism'],
        jobMarketCondition: 'Strong with skills shortages in key areas',
        workVisaRequired: true,
        languages: ['English'],
        costOfLivingIndex: 'High'
      },
      'France': {
        majorIndustries: ['Luxury Goods', 'Technology', 'Aerospace', 'Healthcare', 'Tourism'],
        jobMarketCondition: 'Moderate with strong worker protections',
        workVisaRequired: true,
        languages: ['French', 'English in international companies'],
        costOfLivingIndex: 'Medium to High'
      },
      'Netherlands': {
        majorIndustries: ['Technology', 'Finance', 'Logistics', 'Agriculture', 'Creative Industries'],
        jobMarketCondition: 'Strong with English-friendly work environment',
        workVisaRequired: true,
        languages: ['Dutch', 'English widely accepted'],
        costOfLivingIndex: 'High'
      },
      'Singapore': {
        majorIndustries: ['Finance', 'Technology', 'Logistics', 'Healthcare', 'Manufacturing'],
        jobMarketCondition: 'Competitive with focus on skilled professionals',
        workVisaRequired: true,
        languages: ['English', 'Mandarin', 'Malay'],
        costOfLivingIndex: 'Very High'
      },
      'Japan': {
        majorIndustries: ['Technology', 'Automotive', 'Manufacturing', 'Gaming', 'Robotics'],
        jobMarketCondition: 'Aging workforce creating opportunities',
        workVisaRequired: true,
        languages: ['Japanese', 'English in international companies'],
        costOfLivingIndex: 'High'
      },
      'Switzerland': {
        majorIndustries: ['Finance', 'Pharmaceuticals', 'Technology', 'Manufacturing', 'Tourism'],
        jobMarketCondition: 'Excellent but highly competitive',
        workVisaRequired: true,
        languages: ['German', 'French', 'Italian', 'English'],
        costOfLivingIndex: 'Very High'
      }
    };

    return marketData[countryName] || {
      majorIndustries: ['Technology', 'Finance', 'Healthcare'],
      jobMarketCondition: 'Competitive',
      workVisaRequired: true,
      languages: ['English'],
      costOfLivingIndex: 'Medium'
    };
  }

  private getCurrencySymbol(currency: string): string {
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RUB': '₽',
      'INR': '₹',
      'BRL': 'R$',
      'ZAR': 'R',
      'KRW': '₩',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'MXN': '$',
      'AED': 'د.إ'
    };
    
    return currencySymbols[currency] || currency;
  }

  private formatAssessmentData(answers: AssessmentAnswer[]): string {
    return answers.map(answer => {
      const value = Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer;
      return `${answer.questionId}: ${value}`;
    }).join('\n');
  }

  private cleanJSONResponse(response: string): string {
    // Remove any markdown formatting or extra text
    let cleaned = response.trim();
    
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find the first JSON structure (object or array)
    let jsonStart = -1;
    let startChar = '';
    
    // Look for the first opening brace or bracket
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{' || cleaned[i] === '[') {
        jsonStart = i;
        startChar = cleaned[i];
        break;
      }
    }
    
    if (jsonStart === -1) {
      return cleaned; // No JSON structure found
    }
    
    // Find the matching closing character
    const endChar = startChar === '{' ? '}' : ']';
    let balance = 0;
    let jsonEnd = -1;
    
    for (let i = jsonStart; i < cleaned.length; i++) {
      if (cleaned[i] === startChar) {
        balance++;
      } else if (cleaned[i] === endChar) {
        balance--;
        if (balance === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }
    
    if (jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd);
    }
    
    return cleaned;
  }
}

export const aiService = new AIService();