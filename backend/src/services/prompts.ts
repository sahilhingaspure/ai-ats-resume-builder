export const promptTemplates = {
  // ---- Professional Summary ----
  summarySystem: `You are an ATS resume expert. Generate a concise, professional summary for a resume.
Requirements:
- 3-4 sentences maximum
- Include relevant keywords for ATS systems
- Use strong action-oriented language
- Mention years of experience, key skills, and value proposition
- Do NOT use first person pronouns (I, me, my)
- Return ONLY the summary text, no labels or headers`,

  summaryUser: (role: string, experience: string, skills: string[]) =>
    `Role: ${role}\nExperience: ${experience}\nKey Skills: ${skills.join(', ')}`,

  // ---- Bullet Point Enhancer ----
  bulletSystem: `You are an ATS resume expert. Enhance the given bullet point for a resume.
Requirements:
- Start with a strong action verb
- Include measurable metrics where possible (percentages, numbers, dollar amounts)
- Use ATS-friendly keywords
- Keep it to 1-2 lines maximum
- Make it specific and impactful
- Return ONLY the enhanced bullet point, nothing else`,

  bulletUser: (bullet: string, role?: string, company?: string) => {
    let prompt = `Original bullet point: ${bullet}`;
    if (role) prompt += `\nRole: ${role}`;
    if (company) prompt += `\nCompany: ${company}`;
    return prompt;
  },

  // ---- Skill Categorization ----
  skillCategorizeSystem: `You are a technical recruiter and ATS expert. Categorize the given skills and rate their ATS importance.
Return JSON in this exact format:
{
  "skills": [
    { "name": "skill name", "category": "LANGUAGE|FRAMEWORK|TOOL|CLOUD|DATABASE|SOFT_SKILL|OTHER", "level": 0-100 }
  ]
}
The level represents how important/in-demand the skill is for ATS systems (0-100).
Return valid JSON only.`,

  skillCategorizeUser: (skills: string[]) =>
    `Categorize and rank these skills: ${skills.join(', ')}`,

  // ---- Job Description Analysis ----
  jobAnalysisSystem: `You are an expert job description analyzer. Extract key information from the job description.
Return JSON in this exact format:
{
  "requiredSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"],
  "responsibilities": ["resp1", "resp2"],
  "importance": { "keyword": importance_score_1_to_10 }
}
- requiredSkills: Technical and soft skills explicitly or implicitly required
- keywords: ATS keywords that should appear in a matching resume
- responsibilities: Key job responsibilities
- importance: Map of top keywords to their importance (1-10)
Return valid JSON only.`,

  jobAnalysisUser: (description: string) =>
    `Analyze this job description:\n\n${description}`,

  // ---- Resume Optimization ----
  optimizeSystem: `You are an ATS optimization expert. Compare the resume with the job description and suggest specific optimizations.
Return JSON in this exact format:
{
  "optimizations": [
    { "type": "summary|bullet|skill|keyword", "original": "original text", "optimized": "improved text" }
  ]
}
Focus on:
- Adding missing keywords naturally
- Improving bullet points with metrics
- Enhancing the professional summary
- Reordering skills for relevance
Return valid JSON only.`,

  optimizeUser: (resume: any, jobDescription: string) => {
    const resumeText = formatResumeForPrompt(resume);
    return `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`;
  },

  // ---- Skill Gap Analysis ----
  skillGapSystem: `You are a career advisor and ATS expert. Analyze the skill gap between a resume and job description.
Return JSON in this exact format:
{
  "missingSkills": ["skills the candidate lacks"],
  "weakSkills": ["skills that need improvement"],
  "strongSkills": ["skills that are a good match"],
  "recommendations": ["actionable recommendations"]
}
Return valid JSON only.`,

  skillGapUser: (resume: any, jobDescription: string) => {
    const skills = resume.skills?.map((s: any) => s.name).join(', ') || 'None listed';
    const experience = resume.experiences?.map((e: any) =>
      `${e.jobTitle} at ${e.company}: ${e.responsibilities.join('; ')}`
    ).join('\n') || 'None listed';
    return `Candidate Skills: ${skills}\n\nExperience:\n${experience}\n\nJob Description:\n${jobDescription}`;
  },

  // ---- Career Suggestions ----
  careerSystem: `You are a career advisor. Provide career development suggestions.
Return JSON in this exact format:
{
  "skillsToLearn": ["skill1", "skill2"],
  "certifications": ["cert1", "cert2"],
  "careerPaths": ["path1", "path2"],
  "tips": ["tip1", "tip2"]
}
Return valid JSON only.`,

  careerUser: (role: string, skills: string[], experience: string) =>
    `Current Role: ${role}\nSkills: ${skills.join(', ')}\nExperience Level: ${experience}`,

  // ---- Resume vs Job Comparison ----
  resumeCompareSystem: `You are an expert ATS resume analyst. Compare the resume text against the job description and provide a detailed analysis.
Return JSON in this exact format:
{
  "matchScore": 0-100,
  "matchedSkills": ["skills found in both resume and job"],
  "missingSkills": ["skills in job but not in resume"],
  "strongPoints": ["what the resume does well for this job"],
  "improvements": ["specific suggestions to improve the resume for this job"],
  "keywordMatches": ["ATS keywords found in the resume"],
  "missingKeywords": ["important ATS keywords NOT in the resume"]
}
Be accurate and specific. Return valid JSON only.`,

  resumeCompareUser: (resumeText: string, jobDescription: string) =>
    `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
};

function formatResumeForPrompt(resume: any): string {
  const parts: string[] = [];

  if (resume.personalInfo) {
    parts.push(`Name: ${resume.personalInfo.name}`);
  }

  if (resume.summary) {
    parts.push(`Summary: ${resume.summary.content}`);
  }

  if (resume.experiences?.length) {
    parts.push('Experience:');
    resume.experiences.forEach((exp: any) => {
      parts.push(`- ${exp.jobTitle} at ${exp.company}`);
      exp.responsibilities.forEach((r: string) => parts.push(`  • ${r}`));
    });
  }

  if (resume.skills?.length) {
    parts.push(`Skills: ${resume.skills.map((s: any) => s.name).join(', ')}`);
  }

  if (resume.educations?.length) {
    parts.push('Education:');
    resume.educations.forEach((ed: any) => {
      parts.push(`- ${ed.degree} from ${ed.university} (${ed.graduationYear})`);
    });
  }

  if (resume.projects?.length) {
    parts.push('Projects:');
    resume.projects.forEach((p: any) => {
      parts.push(`- ${p.name}: ${p.description} [${p.technologies.join(', ')}]`);
    });
  }

  return parts.join('\n');
}
