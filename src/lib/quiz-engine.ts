import { Question, DomainRating, RoleType, UserRatings, SkillsTaxonomy, QuizResult, QuizHistoryEntry } from '@/types';

export class QuizEngine {
  private questions: Question[] = [];
  private skillsTaxonomy: SkillsTaxonomy | null = null;
  private ratings: UserRatings = {};
  private recentQuestions: Set<string> = new Set(); // Track recently asked question IDs
  private readonly RECENT_QUESTIONS_LIMIT = 10; // Avoid repeating last 10 questions

  async initialize() {
    // Load questions and skills taxonomy
    const { getAssetPath } = await import('./utils');
    const [questionsResponse, taxonomyResponse] = await Promise.all([
      fetch(getAssetPath('/data/questions_seed.json')),
      fetch(getAssetPath('/data/skills_taxonomy.json'))
    ]);

    if (!questionsResponse.ok || !taxonomyResponse.ok) {
      throw new Error(`Failed to load data files: questions=${questionsResponse.status}, taxonomy=${taxonomyResponse.status}`);
    }

    this.questions = await questionsResponse.json();
    this.skillsTaxonomy = await taxonomyResponse.json();

    // Load ratings from localStorage
    this.loadRatings();
  }

  private loadRatings() {
    const saved = localStorage.getItem('userRatings');
    if (saved) {
      this.ratings = JSON.parse(saved);
      // Convert date strings back to Date objects
      Object.values(this.ratings).forEach(roleRatings => {
        Object.values(roleRatings).forEach(rating => {
          rating.lastUpdated = new Date(rating.lastUpdated);
        });
      });
    }
  }

  private saveRatings() {
    localStorage.setItem('userRatings', JSON.stringify(this.ratings));
  }

  /**
   * Get the current rating for a role/domain combination
   */
  getRating(role: RoleType, domain: string): DomainRating {
    if (!this.ratings[role]) {
      this.ratings[role] = {};
    }

    if (!this.ratings[role][domain]) {
      this.ratings[role][domain] = {
        mean: 5.0, // Start at middle rating
        n: 0,
        lastUpdated: new Date()
      };
    }

    return this.ratings[role][domain];
  }

  /**
   * Get overall role score (average of all domain ratings)
   */
  getRoleScore(role: RoleType): number {
    if (!this.skillsTaxonomy) return 5.0;

    const domains = Object.keys(this.skillsTaxonomy.roles[role].domains);
    if (domains.length === 0) return 5.0;

    const totalRating = domains.reduce((sum, domain) => {
      return sum + this.getRating(role, domain).mean;
    }, 0);

    return totalRating / domains.length;
  }

  /**
   * Select a question for focused practice on a specific role and domain
   */
  selectQuestionForPractice(role: RoleType, domain?: string): Question | null {
    if (!this.skillsTaxonomy || this.questions.length === 0) return null;

    let candidateQuestions: Question[];

    if (domain) {
      // Practice specific domain
      candidateQuestions = this.questions.filter(q =>
        q.role === role &&
        q.domain === domain &&
        !this.recentQuestions.has(q.id)
      );

      // If no fresh questions in target domain, allow recent ones
      if (candidateQuestions.length === 0) {
        candidateQuestions = this.questions.filter(q =>
          q.role === role && q.domain === domain
        );
      }
    } else {
      // Practice any domain in the role
      candidateQuestions = this.questions.filter(q =>
        q.role === role &&
        !this.recentQuestions.has(q.id)
      );

      // If no fresh questions in role, allow recent ones
      if (candidateQuestions.length === 0) {
        candidateQuestions = this.questions.filter(q => q.role === role);
      }
    }

    if (candidateQuestions.length === 0) return null;

    // Select based on current rating for adaptive difficulty
    if (domain) {
      const rating = this.getRating(role, domain);
      let targetDifficulty: 1 | 2 | 3;

      if (rating.mean < 4) {
        targetDifficulty = 1;
      } else if (rating.mean < 7) {
        targetDifficulty = 2;
      } else {
        targetDifficulty = 3;
      }

      // Try to find questions at appropriate difficulty
      const difficultyFilteredQuestions = candidateQuestions.filter(q => q.difficulty === targetDifficulty);
      if (difficultyFilteredQuestions.length > 0) {
        candidateQuestions = difficultyFilteredQuestions;
      }
    }

    // If we have very few questions, reduce recent tracking
    if (domain) {
      const totalQuestionsInDomain = this.questions.filter(q =>
        q.role === role && q.domain === domain
      ).length;

      if (totalQuestionsInDomain <= 3) {
        const recentArray = Array.from(this.recentQuestions);
        this.recentQuestions = new Set(recentArray.slice(-1));
      } else if (totalQuestionsInDomain <= 5) {
        const recentArray = Array.from(this.recentQuestions);
        this.recentQuestions = new Set(recentArray.slice(-2));
      }

      // Re-filter after adjusting recent questions
      candidateQuestions = this.questions.filter(q =>
        q.role === role &&
        q.domain === domain &&
        !this.recentQuestions.has(q.id)
      );

      if (candidateQuestions.length === 0) {
        candidateQuestions = this.questions.filter(q =>
          q.role === role && q.domain === domain
        );
      }
    }

    // Return random question from candidates
    const selectedQuestion = candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)];
    console.log(`Practice mode selected: ${selectedQuestion.id} - ${selectedQuestion.question.substring(0, 50)}...`);
    this.addToRecentQuestions(selectedQuestion.id);
    return selectedQuestion;
  }

  /**
   * Select the next question using adaptive logic
   * Priority: Role priority -> Lowest domain rating -> Appropriate difficulty -> Avoid recent questions
   */
  selectNextQuestion(userPriorities: RoleType[] = ['embedded', 'swe', 'ml_dl', 'genai', 'coding']): Question | null {
    if (!this.skillsTaxonomy || this.questions.length === 0) return null;

    // Find the highest priority role that needs work
    let targetRole: RoleType | null = null;
    let targetDomain: string | null = null;
    let lowestRating = 10;

    for (const role of userPriorities) {
      const domains = Object.keys(this.skillsTaxonomy.roles[role].domains);

      for (const domain of domains) {
        const rating = this.getRating(role, domain);
        if (rating.mean < lowestRating) {
          lowestRating = rating.mean;
          targetRole = role;
          targetDomain = domain;
        }
      }

      // If we found a weak area in this high-priority role, focus on it
      if (targetRole === role && lowestRating < 7) {
        break;
      }
    }

    if (!targetRole || !targetDomain) return null;

    // Select appropriate difficulty based on rating
    const rating = this.getRating(targetRole, targetDomain);
    let targetDifficulty: 1 | 2 | 3;

    if (rating.mean < 4) {
      targetDifficulty = 1; // Basic
    } else if (rating.mean < 7) {
      targetDifficulty = 2; // Intermediate
    } else {
      targetDifficulty = 3; // Advanced
    }

    // Find questions matching criteria, excluding recent questions
    let candidateQuestions = this.questions.filter(q =>
      q.role === targetRole &&
      q.domain === targetDomain &&
      q.difficulty === targetDifficulty &&
      !this.recentQuestions.has(q.id)
    );

    // If no fresh questions at target difficulty, try other difficulties in same domain
    if (candidateQuestions.length === 0) {
      candidateQuestions = this.questions.filter(q =>
        q.role === targetRole &&
        q.domain === targetDomain &&
        !this.recentQuestions.has(q.id)
      );
    }

    // If still no fresh questions in target domain, expand to any domain in the role
    if (candidateQuestions.length === 0) {
      candidateQuestions = this.questions.filter(q =>
        q.role === targetRole &&
        !this.recentQuestions.has(q.id)
      );
    }

    // If we've exhausted all fresh questions, adjust strategy based on available questions
    if (candidateQuestions.length === 0) {
      const totalQuestionsInDomain = this.questions.filter(q =>
        q.role === targetRole && q.domain === targetDomain
      ).length;

      // If we have very few questions in this domain, reduce the recent questions limit
      if (totalQuestionsInDomain <= 3) {
        // For small question pools, only track the last 1 question
        const recentArray = Array.from(this.recentQuestions);
        this.recentQuestions = new Set(recentArray.slice(-1));
      } else if (totalQuestionsInDomain <= 5) {
        // For medium question pools, only track the last 2 questions
        const recentArray = Array.from(this.recentQuestions);
        this.recentQuestions = new Set(recentArray.slice(-2));
      }

      candidateQuestions = this.questions.filter(q =>
        q.role === targetRole &&
        q.domain === targetDomain &&
        q.difficulty === targetDifficulty &&
        !this.recentQuestions.has(q.id)
      );
    }

    // Still no questions? Return any available question from domain
    if (candidateQuestions.length === 0) {
      candidateQuestions = this.questions.filter(q =>
        q.role === targetRole && q.domain === targetDomain
      );
    }

    if (candidateQuestions.length === 0) return null;

    // Return random question from candidates
    const selectedQuestion = candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)];

    // Track this question as recently asked
    this.addToRecentQuestions(selectedQuestion.id);

    return selectedQuestion;
  }

  /**
   * Add question to recent questions tracking
   */
  private addToRecentQuestions(questionId: string) {
    this.recentQuestions.add(questionId);

    // Keep only the most recent questions
    if (this.recentQuestions.size > this.RECENT_QUESTIONS_LIMIT) {
      const questionsArray = Array.from(this.recentQuestions);
      this.recentQuestions = new Set(questionsArray.slice(-this.RECENT_QUESTIONS_LIMIT));
    }
  }

  /**
   * Update rating based on quiz result using smoothed scoring
   */
  updateRating(result: QuizResult, question: Question, userAnswer: number, confidence: number = 3) {
    const rating = this.getRating(question.role, question.domain);

    // Calculate target score based on difficulty and correctness
    const baseDifficultyScore = { 1: 3, 2: 6, 3: 8 }[question.difficulty];
    const adjustment = result.correct ? 1 : -1;
    const targetScore = baseDifficultyScore + adjustment;

    // Smooth update (20% weight to new result)
    const alpha = 0.2;
    const newMean = Math.max(1, Math.min(10,
      rating.mean + alpha * (targetScore - rating.mean)
    ));

    // Update rating
    this.ratings[question.role][question.domain] = {
      mean: newMean,
      n: rating.n + 1,
      lastUpdated: new Date()
    };

    // Save to quiz history
    this.saveToHistory(question, userAnswer, result.correct, result.timeSpent, confidence);

    this.saveRatings();
  }

  /**
   * Save question and answer to quiz history
   */
  private saveToHistory(question: Question, userAnswer: number, correct: boolean, timeSpent: number, confidence: number) {
    const historyEntry: QuizHistoryEntry = {
      id: `${question.id}_${Date.now()}`,
      question,
      userAnswer,
      correct,
      timeSpent,
      confidence,
      timestamp: new Date()
    };

    const history = this.getQuizHistory();
    history.unshift(historyEntry); // Add to beginning (most recent first)

    // Keep only last 500 entries to prevent localStorage from getting too large
    const limitedHistory = history.slice(0, 500);

    localStorage.setItem('quizHistory', JSON.stringify(limitedHistory));
  }

  /**
   * Get quiz history
   */
  getQuizHistory(): QuizHistoryEntry[] {
    const saved = localStorage.getItem('quizHistory');
    if (!saved) return [];

    const history = JSON.parse(saved);
    return history.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  }

  /**
   * Get quiz history filtered by role, domain, or correctness
   */
  getFilteredHistory(filters: {
    role?: RoleType;
    domain?: string;
    correct?: boolean;
    limit?: number;
  } = {}): QuizHistoryEntry[] {
    let history = this.getQuizHistory();

    if (filters.role) {
      history = history.filter(entry => entry.question.role === filters.role);
    }

    if (filters.domain) {
      history = history.filter(entry => entry.question.domain === filters.domain);
    }

    if (filters.correct !== undefined) {
      history = history.filter(entry => entry.correct === filters.correct);
    }

    if (filters.limit) {
      history = history.slice(0, filters.limit);
    }

    return history;
  }

  /**
   * Get quiz statistics
   */
  getQuizStats() {
    const history = this.getQuizHistory();

    if (history.length === 0) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        averageConfidence: 0,
        streakCount: 0
      };
    }

    const correctAnswers = history.filter(entry => entry.correct).length;
    const totalTime = history.reduce((sum, entry) => sum + entry.timeSpent, 0);
    const totalConfidence = history.reduce((sum, entry) => sum + entry.confidence, 0);

    // Calculate current streak (consecutive correct answers from most recent)
    let streakCount = 0;
    for (const entry of history) {
      if (entry.correct) {
        streakCount++;
      } else {
        break;
      }
    }

    return {
      totalQuestions: history.length,
      correctAnswers,
      accuracy: Math.round((correctAnswers / history.length) * 100),
      averageTime: Math.round(totalTime / history.length),
      averageConfidence: Math.round((totalConfidence / history.length) * 10) / 10,
      streakCount
    };
  }

  /**
   * Get weak areas across all roles for focused study
   */
  getWeakAreas(limit: number = 5): Array<{role: RoleType, domain: string, rating: number}> {
    const weakAreas: Array<{role: RoleType, domain: string, rating: number}> = [];

    if (!this.skillsTaxonomy) return weakAreas;

    Object.entries(this.skillsTaxonomy.roles).forEach(([roleKey, role]) => {
      const roleType = roleKey as RoleType;
      Object.keys(role.domains).forEach(domain => {
        const rating = this.getRating(roleType, domain);
        weakAreas.push({
          role: roleType,
          domain,
          rating: rating.mean
        });
      });
    });

    return weakAreas
      .sort((a, b) => a.rating - b.rating)
      .slice(0, limit);
  }

  /**
   * Get progress statistics
   */
  getProgressStats() {
    if (!this.skillsTaxonomy) return null;

    const stats = {
      overall: 0,
      byRole: {} as Record<RoleType, number>,
      totalQuestions: 0,
      questionsAnswered: 0
    };

    const roles = Object.keys(this.skillsTaxonomy.roles) as RoleType[];
    let totalRating = 0;
    let totalQuestions = 0;

    roles.forEach(role => {
      const roleScore = this.getRoleScore(role);
      stats.byRole[role] = roleScore;
      totalRating += roleScore;

      const domains = Object.keys(this.skillsTaxonomy!.roles[role].domains);
      domains.forEach(domain => {
        const rating = this.getRating(role, domain);
        totalQuestions += rating.n;
      });
    });

    stats.overall = totalRating / roles.length;
    stats.totalQuestions = this.questions.length;
    stats.questionsAnswered = totalQuestions;

    return stats;
  }

  /**
   * Export ratings for backup/analysis
   */
  exportRatings() {
    return {
      ratings: this.ratings,
      exportDate: new Date(),
      version: '1.0'
    };
  }

  /**
   * Import ratings from backup
   */
  importRatings(data: any) {
    if (data.ratings && data.version) {
      this.ratings = data.ratings;
      this.saveRatings();
      return true;
    }
    return false;
  }
}