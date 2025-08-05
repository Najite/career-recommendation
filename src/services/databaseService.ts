import { supabase } from '../lib/supabase';
import { AssessmentAnswer, CareerRecommendation } from '../types';
import type { CareerRecommendationDB } from '../lib/supabase';

class DatabaseService {
  async saveAssessment(userId: string, answers: AssessmentAnswer[]): Promise<string> {
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        answers: answers,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async saveCareerRecommendations(
    userId: string,
    assessmentId: string,
    recommendations: CareerRecommendation[],
    selectedCountries: string[]
  ): Promise<void> {
    // First, delete any existing recommendations for this user to avoid duplicates
    await supabase
      .from('career_recommendations')
      .delete()
      .eq('user_id', userId);

    const recommendationsData = recommendations.map(rec => ({
      user_id: userId,
      assessment_id: assessmentId,
      title: rec.title,
      match_percentage: rec.match,
      description: rec.description,
      average_salary: rec.averageSalary,
      growth_rate: rec.growthRate,
      required_skills: rec.requiredSkills,
      learning_path: rec.learningPath,
      job_market_demand: rec.jobMarketDemand,
      selected_countries: selectedCountries,
    }));

    const { error } = await supabase
      .from('career_recommendations')
      .insert(recommendationsData);

    if (error) throw error;
  }

  async getUserRecommendations(userId: string): Promise<CareerRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('career_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10); // Limit to most recent 10 recommendations

      if (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
      if (!data) return [];

      console.log(`Fetched ${data.length} recommendations from database for user ${userId}`);
      return data.map(this.mapDBRecommendationToCareerRecommendation);
    } catch (error) {
      console.error('getUserRecommendations error:', error);
      return [];
    }
  }

  async getLatestAssessment(userId: string): Promise<AssessmentAnswer[] | null> {
    const { data, error } = await supabase
      .from('assessments')
      .select('answers')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data.answers;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  private mapDBRecommendationToCareerRecommendation(dbRec: CareerRecommendationDB): CareerRecommendation {
    return {
      id: dbRec.id,
      title: dbRec.title,
      match: dbRec.match_percentage,
      description: dbRec.description,
      averageSalary: dbRec.average_salary,
      growthRate: dbRec.growth_rate,
      requiredSkills: dbRec.required_skills,
      learningPath: dbRec.learning_path,
      jobMarketDemand: dbRec.job_market_demand as 'high' | 'medium' | 'low',
    };
  }
}

export const databaseService = new DatabaseService();