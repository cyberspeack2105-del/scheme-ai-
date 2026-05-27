const schemesData = require('./schemes.json');
const jobsData = require('./jobs.json');

// Helper to calculate keyword matching score
const calculateScore = (text, keywords) => {
  if (!text) return 0;
  text = text.toLowerCase();
  let score = 0;
  keywords.forEach(kw => {
    if (text.includes(kw.toLowerCase())) {
      score += 1;
    }
  });
  return score;
};

class RecommendationEngine {
  constructor() {
    this.schemes = schemesData;
    this.jobs = jobsData;
    
    // Normalize data columns just like Python
    this.schemes.forEach(s => {
      // Ensure lower columns
      s.combined_text = `${s.scheme_name || ''} ${s.description || ''} ${s.scheme_type || ''}`.toLowerCase();
    });
    
    this.jobs.forEach(j => {
      j.combined_text = `${j.name || ''} ${j.description || ''} ${j.type || ''}`.toLowerCase();
    });
  }

  getRecommendations(userProfile) {
    const occupation = (userProfile.occupation || '').toLowerCase();
    
    const skills = (userProfile.skills || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s);
      
    const interests = (userProfile.interest || '')
      .split(',')
      .map(i => i.trim().toLowerCase())
      .filter(i => i);
      
    // Schemes match keywords based on occupation
    let occKeywords = [];
    if (occupation.includes('student') || occupation.includes('graduating')) {
      occKeywords = ['scholarship', 'education', 'student', 'learning', 'skill', 'training'];
    } else if (occupation.includes('unemployed')) {
      occKeywords = ['employment', 'loan', 'skill', 'pension', 'livelihood', 'guarantee'];
    } else if (occupation.includes('employed')) {
      occKeywords = ['housing', 'insurance', 'pension', 'tech', 'finance'];
    } else if (occupation.includes('farmer') || occupation.includes('agriculture')) {
      occKeywords = ['farmer', 'agriculture', 'kisan', 'crop', 'loan', 'irrigation', 'rural'];
    } else if (occupation.includes('business')) {
      occKeywords = ['business', 'loan', 'msme', 'startup', 'credit', 'entrepreneur'];
    } else if (occupation.includes('retired')) {
      occKeywords = ['pension', 'senior', 'health', 'security'];
    } else {
      occKeywords = ['citizen', 'welfare', 'scheme', 'financial', 'support'];
    }

    // Filter Schemes
    const schemeResults = [];
    this.schemes.forEach(scheme => {
      let score = 0;
      // Occupation match (High weight)
      score += calculateScore(scheme.combined_text, occKeywords) * 2;
      // Interest match
      score += calculateScore(scheme.combined_text, interests);
      
      if (score > 0) {
        // Clone object to avoid side effects
        const cleanedScheme = { ...scheme };
        delete cleanedScheme.combined_text;
        cleanedScheme.match_score = score;
        schemeResults.push(cleanedScheme);
      }
    });

    // Sort by score desc
    schemeResults.sort((a, b) => b.match_score - a.match_score);

    // Filter Jobs
    const jobResults = [];
    const jobKeywords = [...skills, ...interests];
    const isStudent = occupation.includes('student') || occupation.includes('graduating') || occupation.includes('fresher');
    
    if (isStudent) {
      jobKeywords.push('internship', 'fresher', 'entry', 'scholarship', 'training');
    }
    
    const majorPortals = ['naukri', 'indeed', 'linkedin', 'monster', 'glassdoor', 'shine'];
    
    this.jobs.forEach(job => {
      let score = 0;
      
      // Keyword Match
      score += calculateScore(job.combined_text, jobKeywords);
      
      // Student Context Boost
      if (isStudent && (
        job.combined_text.includes('fresher') || 
        job.combined_text.includes('intern') || 
        job.combined_text.includes('entry') || 
        job.combined_text.includes('training')
      )) {
        score += 2;
      }
      
      // Popularity Boost
      if (majorPortals.some(p => job.combined_text.includes(p))) {
        score += 0.5;
      }
      
      const cleanedJob = { ...job };
      delete cleanedJob.combined_text;
      cleanedJob.match_score = score;
      jobResults.push(cleanedJob);
    });

    // Sort by score desc
    jobResults.sort((a, b) => b.match_score - a.match_score);

    return {
      schemes: schemeResults.slice(0, 50),
      jobs: jobResults.slice(0, 50)
    };
  }

  analyzeSkillGap(userSkills, targetRole) {
    targetRole = (targetRole || '').toLowerCase().trim();
    
    // Normalize user skills: lowercase, trim, split both by comma and space
    const normalizeSkill = (s) => s.toLowerCase().trim().replace(/[^a-z0-9#+.]/g, '');
    const userSkillsRaw = userSkills.map(s => s.trim().toLowerCase()).filter(s => s);
    const userSkillsSet = new Set(userSkillsRaw.map(s => normalizeSkill(s)));
    
    // Extract keywords from role - split on spaces, dots, slashes
    const cleanRole = targetRole.replace(/[^\w\s]/g, ' ');
    const roleWords = cleanRole.split(/\s+/).map(k => k.trim()).filter(k => k.length > 1);
    
    // Common skill abbreviations / aliases for fuzzy matching
    const skillAliases = {
      'js': 'javascript',
      'javascript': 'js',
      'ts': 'typescript',
      'typescript': 'ts',
      'py': 'python',
      'python': 'py',
      'node': 'node.js',
      'nodejs': 'node.js',
      'react': 'reactjs',
      'reactjs': 'react',
      'vue': 'vuejs',
      'vuejs': 'vue',
      'cpp': 'c++',
      'c++': 'cpp',
      'cs': 'c#',
      'c#': 'cs',
      'ml': 'machine learning',
      'ai': 'artificial intelligence',
      'dl': 'deep learning',
    };

    // Expanded keywords for role-based job matching (add synonyms)
    const synonyms = {
      'developer': ['development', 'engineer', 'engineering'],
      'development': ['developer', 'engineer'],
      'engineer': ['engineering', 'developer', 'development'],
      'engineering': ['engineer', 'developer'],
      'admin': ['administration', 'administrator'],
      'administration': ['admin'],
      'manager': ['management', 'lead'],
      'management': ['manager'],
      'web': ['website', 'frontend', 'backend', 'fullstack', 'full stack'],
      'data': ['database', 'analytics', 'science', 'scientist'],
      'cloud': ['aws', 'azure', 'gcp', 'devops'],
      'software': ['developer', 'engineer', 'programming'],
      'it': ['information technology', 'tech'],
      'full': ['fullstack', 'full stack'],
      'stack': ['fullstack', 'full stack'],
    };
    
    const expandedKeywords = new Set(roleWords);
    roleWords.forEach(k => {
      if (synonyms[k]) {
        synonyms[k].forEach(syn => expandedKeywords.add(syn));
      }
    });

    // If role is very short or generic (1 keyword), add broad IT keywords
    if (expandedKeywords.size <= 2) {
      ['software', 'developer', 'engineer', 'it', 'tech'].forEach(k => expandedKeywords.add(k));
    }

    // Filter relevant jobs - match if ANY keyword found in job domains, requirements, or name
    const relevantJobs = this.jobs.filter(job => {
      const domains = (job.job_domains || '').toLowerCase();
      const reqs = (job.skill_requirements || '').toLowerCase();
      const name = (job.name || '').toLowerCase();
      const allJobText = `${domains} ${reqs} ${name}`;
      
      return Array.from(expandedKeywords).some(kw => allJobText.includes(kw));
    });

    // If no jobs found with role keywords, use ALL jobs as fallback (generic analysis)
    const jobsToAnalyze = relevantJobs.length > 0 ? relevantJobs : this.jobs;

    // Aggregate required skills from matched jobs
    const requiredSkillsSet = new Set();
    jobsToAnalyze.forEach(job => {
      const skillsStr = job.skill_requirements || '';
      skillsStr.split(',').forEach(s => {
        const cleanS = s.trim().toLowerCase();
        if (cleanS) {
          requiredSkillsSet.add(cleanS);
        }
      });
    });

    // Smart skill matching: check if user skill matches required skill (fuzzy)
    const isSkillMatch = (userSkill, requiredSkill) => {
      const uNorm = normalizeSkill(userSkill);
      const rNorm = normalizeSkill(requiredSkill);
      
      if (uNorm === rNorm) return true;
      // Check if one contains the other (e.g. "javascript" in "javascript/typescript")
      if (uNorm.length > 2 && rNorm.includes(uNorm)) return true;
      if (rNorm.length > 2 && uNorm.includes(rNorm)) return true;
      // Check aliases
      if (skillAliases[uNorm] && normalizeSkill(skillAliases[uNorm]) === rNorm) return true;
      if (skillAliases[rNorm] && normalizeSkill(skillAliases[rNorm]) === uNorm) return true;
      return false;
    };

    const requiredSkillsList = Array.from(requiredSkillsSet);
    
    const matchedSkills = requiredSkillsList.filter(reqSkill =>
      userSkillsRaw.some(userSkill => isSkillMatch(userSkill, reqSkill))
    );
    
    const missingSkills = requiredSkillsList.filter(reqSkill =>
      !userSkillsRaw.some(userSkill => isSkillMatch(userSkill, reqSkill))
    );
    
    matchedSkills.sort();
    missingSkills.sort();
    
    const totalRequired = requiredSkillsSet.size;
    const score = totalRequired > 0 ? Math.round((matchedSkills.length / totalRequired) * 100) : 0;
    
    // Format missing skills with links (max 12)
    const missingWithLinks = missingSkills.slice(0, 12).map(skill => {
      const query = `learn ${skill} course`;
      const link = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const course_link = `https://www.classcentral.com/search?q=${encodeURIComponent(skill)}`;
      
      const titleCaseSkill = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      return {
        name: titleCaseSkill,
        link,
        course_link
      };
    });

    return {
      role: targetRole,
      missing_skills: missingWithLinks,
      matched_skills: matchedSkills.map(s => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')),
      score
    };
  }
}

module.exports = new RecommendationEngine();

