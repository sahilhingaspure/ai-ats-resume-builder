import Groq from 'groq-sdk';
import { promptTemplates } from './prompts';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

class AIError extends Error {
  constructor(message: string, public statusCode: number = 503) {
    super(message);
    this.name = 'AIError';
  }
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const status = error?.status || error?.statusCode;
      if (status === 429 && attempt < maxRetries) {
        const waitSec = Math.min(10 * (attempt + 1), 30);
        console.log(`Groq rate limited, retrying in ${waitSec}s (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue;
      }
      if (status === 429) {
        throw new AIError('AI service is temporarily busy (rate limit). Please wait a moment and try again.', 429);
      }
      if (status === 401) {
        throw new AIError('AI API key is invalid. Please check your Groq API key.', 401);
      }
      throw new AIError(`AI service error: ${error.message?.substring(0, 150) || 'Unknown error'}`, 502);
    }
  }
  throw new AIError('AI service unavailable after retries', 503);
}

export class AIService {
  private async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    return withRetry(async () => {
      const completion = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });
      return (completion.choices[0]?.message?.content || '').trim();
    });
  }

  private async chatJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    return withRetry(async () => {
      const completion = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no extra text.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });
      const text = (completion.choices[0]?.message?.content || '').trim();
      return JSON.parse(text) as T;
    });
  }

  async generateProfessionalSummary(role: string, experience: string, skills: string[]): Promise<string> {
    return this.chat(
      promptTemplates.summarySystem,
      promptTemplates.summaryUser(role, experience, skills)
    );
  }

  async enhanceBulletPoint(bullet: string, role?: string, company?: string): Promise<string> {
    return this.chat(
      promptTemplates.bulletSystem,
      promptTemplates.bulletUser(bullet, role, company)
    );
  }

  async categorizeSkills(skills: string[]): Promise<Array<{ name: string; category: string; level: number }>> {
    const result = await this.chatJSON<{ skills: Array<{ name: string; category: string; level: number }> }>(
      promptTemplates.skillCategorizeSystem,
      promptTemplates.skillCategorizeUser(skills)
    );
    return result.skills || [];
  }

  async analyzeJobDescription(description: string): Promise<{
    requiredSkills: string[];
    keywords: string[];
    responsibilities: string[];
    importance: Record<string, number>;
  }> {
    return this.chatJSON(
      promptTemplates.jobAnalysisSystem,
      promptTemplates.jobAnalysisUser(description)
    );
  }

  async optimizeResumeForJob(resume: any, jobDescription: string): Promise<Array<{
    type: string;
    original: string;
    optimized: string;
  }>> {
    const result = await this.chatJSON<{ optimizations: Array<{ type: string; original: string; optimized: string }> }>(
      promptTemplates.optimizeSystem,
      promptTemplates.optimizeUser(resume, jobDescription)
    );
    return result.optimizations || [];
  }

  async skillGapAnalysis(resume: any, jobDescription: string): Promise<{
    missingSkills: string[];
    weakSkills: string[];
    strongSkills: string[];
    recommendations: string[];
  }> {
    return this.chatJSON(
      promptTemplates.skillGapSystem,
      promptTemplates.skillGapUser(resume, jobDescription)
    );
  }

  async getCareerSuggestions(role: string, skills: string[], experience: string): Promise<{
    skillsToLearn: string[];
    certifications: string[];
    careerPaths: string[];
    tips: string[];
  }> {
    return this.chatJSON(
      promptTemplates.careerSystem,
      promptTemplates.careerUser(role, skills, experience)
    );
  }

  async compareResumeWithJob(resumeText: string, jobDescription: string): Promise<{
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    strongPoints: string[];
    improvements: string[];
    keywordMatches: string[];
    missingKeywords: string[];
  }> {
    return this.chatJSON(
      promptTemplates.resumeCompareSystem,
      promptTemplates.resumeCompareUser(resumeText, jobDescription)
    );
  }
}
