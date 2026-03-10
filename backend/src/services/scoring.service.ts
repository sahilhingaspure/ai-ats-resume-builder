const ACTION_VERBS = [
  'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'collaborated', 'configured', 'consolidated', 'coordinated',
  'created', 'debugged', 'delivered', 'deployed', 'designed', 'developed',
  'directed', 'documented', 'drove', 'enabled', 'engineered', 'enhanced',
  'established', 'evaluated', 'executed', 'expanded', 'facilitated',
  'formulated', 'generated', 'guided', 'identified', 'implemented',
  'improved', 'increased', 'influenced', 'initiated', 'innovated',
  'integrated', 'launched', 'led', 'leveraged', 'managed', 'mentored',
  'migrated', 'modernized', 'monitored', 'negotiated', 'optimized',
  'orchestrated', 'oversaw', 'partnered', 'pioneered', 'planned',
  'presented', 'prioritized', 'produced', 'programmed', 'proposed',
  'published', 'redesigned', 'reduced', 'refactored', 'resolved',
  'revamped', 'scaled', 'spearheaded', 'standardized', 'streamlined',
  'strengthened', 'supervised', 'tested', 'trained', 'transformed',
  'troubleshot', 'unified', 'upgraded', 'utilized',
];

interface ScoreResult {
  keywordMatch: number;
  skillsAlign: number;
  formatting: number;
  actionVerbs: number;
  expRelevance: number;
  totalScore: number;
  suggestions: string[];
}

export class ScoringService {
  async scoreResume(resume: any, jobDescription: string): Promise<ScoreResult> {
    const suggestions: string[] = [];

    // Extract keywords from job description
    const jdWords = this.extractKeywords(jobDescription);

    // 1. Keyword Match (30%)
    const resumeText = this.getResumeText(resume);
    const resumeWordsSet = new Set(this.extractKeywords(resumeText));
    const matchedKeywords = jdWords.filter(kw => resumeWordsSet.has(kw));
    const keywordRatio = jdWords.length > 0 ? matchedKeywords.length / jdWords.length : 0;
    const keywordMatch = Math.min(Math.round(keywordRatio * 100), 100);

    if (keywordMatch < 50) {
      const missing = jdWords.filter(kw => !resumeWordsSet.has(kw)).slice(0, 5);
      suggestions.push(`Add missing keywords: ${missing.join(', ')}`);
    }

    // 2. Skills Alignment (25%)
    const resumeSkills = (resume.skills || []).map((s: any) => s.name.toLowerCase());
    const jdLower = jobDescription.toLowerCase();
    const matchedSkills = resumeSkills.filter((skill: string) => jdLower.includes(skill));
    const skillsAlign = resumeSkills.length > 0
      ? Math.min(Math.round((matchedSkills.length / resumeSkills.length) * 100), 100)
      : 0;

    if (skillsAlign < 60) {
      suggestions.push('Add more relevant skills that match the job description');
    }

    // 3. Formatting (15%)
    let formatting = 70; // baseline
    if (resume.personalInfo) formatting += 5;
    if (resume.summary?.content && resume.summary.content.length >= 50) formatting += 5;
    if (resume.experiences?.length > 0) formatting += 5;
    if (resume.skills?.length >= 5) formatting += 5;
    if (resume.educations?.length > 0) formatting += 5;
    if (resume.projects?.length > 0) formatting += 5;
    formatting = Math.min(formatting, 100);

    if (!resume.summary?.content) {
      suggestions.push('Add a professional summary section');
    }
    if (!resume.skills?.length) {
      suggestions.push('Add a skills section');
    }

    // 4. Action Verbs (15%)
    const bullets = this.getAllBullets(resume);
    let actionVerbCount = 0;
    bullets.forEach(bullet => {
      const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase();
      if (firstWord && ACTION_VERBS.includes(firstWord)) actionVerbCount++;
    });
    const actionVerbs = bullets.length > 0
      ? Math.min(Math.round((actionVerbCount / bullets.length) * 100), 100)
      : 0;

    if (actionVerbs < 60) {
      suggestions.push('Start more bullet points with strong action verbs (e.g., Developed, Implemented, Designed)');
    }

    // 5. Experience Relevance (15%)
    const expText = (resume.experiences || [])
      .map((e: any) => `${e.jobTitle} ${e.responsibilities.join(' ')}`)
      .join(' ')
      .toLowerCase();
    const relevantKeywords = jdWords.filter(kw => expText.includes(kw));
    const expRelevance = jdWords.length > 0
      ? Math.min(Math.round((relevantKeywords.length / jdWords.length) * 100), 100)
      : 0;

    if (expRelevance < 40) {
      suggestions.push('Tailor your experience bullet points to better match the job description');
    }

    // Weighted total
    const totalScore = Math.round(
      keywordMatch * 0.30 +
      skillsAlign * 0.25 +
      formatting * 0.15 +
      actionVerbs * 0.15 +
      expRelevance * 0.15
    );

    if (totalScore >= 80) {
      suggestions.unshift('Great resume! Minor refinements can push it even higher.');
    } else if (totalScore >= 60) {
      suggestions.unshift('Good foundation — focus on keyword optimization and stronger bullet points.');
    } else {
      suggestions.unshift('Significant improvements needed — focus on matching keywords and adding metrics.');
    }

    return { keywordMatch, skillsAlign, formatting, actionVerbs, expRelevance, totalScore, suggestions };
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each',
      'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'as',
      'about', 'above', 'after', 'again', 'also', 'any', 'because',
      'before', 'below', 'between', 'during', 'into', 'just', 'over',
      'through', 'under', 'until', 'up', 'our', 'your', 'their', 'its',
      'etc', 'ability', 'experience', 'work', 'working', 'including',
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
      .filter((w, i, arr) => arr.indexOf(w) === i); // dedupe
  }

  private getResumeText(resume: any): string {
    const parts: string[] = [];
    if (resume.summary?.content) parts.push(resume.summary.content);
    (resume.experiences || []).forEach((e: any) => {
      parts.push(e.jobTitle, e.company, ...e.responsibilities);
    });
    (resume.skills || []).forEach((s: any) => parts.push(s.name));
    (resume.projects || []).forEach((p: any) => {
      parts.push(p.name, p.description, ...p.technologies);
    });
    return parts.join(' ');
  }

  private getAllBullets(resume: any): string[] {
    const bullets: string[] = [];
    (resume.experiences || []).forEach((e: any) => {
      bullets.push(...e.responsibilities);
    });
    return bullets;
  }
}
