import { DailyPlan, StudyBlock, RoleType, UserRatings } from '@/types';
import { QuizEngine } from './quiz-engine';

export class DailyPlanner {
  private quizEngine: QuizEngine;

  constructor(quizEngine: QuizEngine) {
    this.quizEngine = quizEngine;
  }

  /**
   * Generate a daily plan based on available hours and user priorities
   */
  generateDailyPlan(
    availableHours: number,
    userPriorities: RoleType[] = ['embedded', 'swe', 'ml_dl', 'genai', 'coding'],
    preferences: {
      quizTimeRatio: number; // 0.0 to 1.0
      projectTimeRatio: number; // 0.0 to 1.0
    } = {
      quizTimeRatio: 0.5,
      projectTimeRatio: 0.5
    }
  ): DailyPlan {
    const totalMinutes = availableHours * 60;
    const blocks: StudyBlock[] = [];

    // Calculate time allocation
    const quizMinutes = Math.round(totalMinutes * preferences.quizTimeRatio);
    const projectMinutes = Math.round(totalMinutes * preferences.projectTimeRatio);

    // Determine focus role (highest priority role with lowest average rating)
    const focusRole = this.determineFocusRole(userPriorities);

    // Generate quiz blocks (split into smaller chunks for better focus)
    if (quizMinutes > 0) {
      const quizBlocks = this.createQuizBlocks(quizMinutes, focusRole);
      blocks.push(...quizBlocks);
    }

    // Generate project block
    if (projectMinutes > 0) {
      blocks.push(this.createProjectBlock(projectMinutes, focusRole));
    }

    return {
      date: new Date(),
      totalHours: availableHours,
      blocks,
      focus: focusRole,
      created: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Determine the focus role for the day
   */
  private determineFocusRole(userPriorities: RoleType[]): RoleType {
    let focusRole = userPriorities[0];
    let lowestScore = 10;

    for (const role of userPriorities) {
      const roleScore = this.quizEngine.getRoleScore(role);
      if (roleScore < lowestScore) {
        lowestScore = roleScore;
        focusRole = role;
        // If this role needs significant work, prioritize it
        if (roleScore < 7) break;
      }
    }

    return focusRole;
  }


  /**
   * Create quiz blocks targeting weak areas
   */
  private createQuizBlocks(totalMinutes: number, focusRole: RoleType): StudyBlock[] {
    const blocks: StudyBlock[] = [];
    const weakAreas = this.quizEngine.getWeakAreas(3);

    // If we have less than 40 minutes, create one block
    if (totalMinutes < 40) {
      const targetArea = weakAreas.find(area => area.role === focusRole) || weakAreas[0];

      blocks.push({
        id: `quiz_${Date.now()}`,
        type: 'quiz',
        duration: totalMinutes,
        title: 'Adaptive Quiz',
        description: `Target: ${this.getRoleDisplayName(targetArea?.role || focusRole)} - ${this.getDomainDisplayName(targetArea?.domain || 'general')}`,
        role: targetArea?.role || focusRole,
        domain: targetArea?.domain,
        completed: false
      });
    } else {
      // Split into 25-30 minute focus blocks
      const blockDuration = Math.min(30, Math.floor(totalMinutes / 2));
      let remainingMinutes = totalMinutes;
      let blockCount = 0;

      while (remainingMinutes > 15 && blockCount < 3) {
        const thisBlockDuration = Math.min(blockDuration, remainingMinutes);
        const targetArea = weakAreas[blockCount % weakAreas.length];

        blocks.push({
          id: `quiz_${Date.now()}_${blockCount}`,
          type: 'quiz',
          duration: thisBlockDuration,
          title: `Quiz Block ${blockCount + 1}`,
          description: `Target: ${this.getRoleDisplayName(targetArea?.role || focusRole)} - ${this.getDomainDisplayName(targetArea?.domain || 'general')}`,
          role: targetArea?.role || focusRole,
          domain: targetArea?.domain,
          completed: false
        });

        remainingMinutes -= thisBlockDuration;
        blockCount++;
      }
    }

    return blocks;
  }

  /**
   * Create project work block
   */
  private createProjectBlock(minutes: number, focusRole: RoleType): StudyBlock {
    const projectIdeas = {
      embedded: [
        'Work on STM32/ESP32 driver implementation',
        'Build RTOS task with FreeRTOS',
        'Implement I2C/SPI communication protocol',
        'Device tree configuration practice',
        'Linux kernel module development'
      ],
      swe: [
        'Implement classic DSA patterns with tests',
        'Build REST API with proper error handling',
        'Docker containerization practice',
        'SQL query optimization challenges',
        'System design documentation'
      ],
      ml_dl: [
        'Computer vision pipeline with OpenCV',
        'PyTorch model training and evaluation',
        'Data preprocessing and feature engineering',
        'Model deployment with Docker',
        'Experiment tracking setup'
      ],
      genai: [
        'LoRA fine-tuning implementation',
        'RAG system with vector database',
        'Prompt engineering experiments',
        'LLM evaluation metrics development',
        'GPU optimization for inference'
      ],
      coding: [
        'Implement classic sorting algorithms (merge, quick, heap)',
        'Build data structures from scratch (BST, hash table, graph)',
        'Solve LeetCode problems focusing on weak algorithm types',
        'Create coding interview practice problems in C++/Python',
        'Build a memory management library in C',
        'Implement design patterns (singleton, factory, observer)',
        'Practice competitive programming problems',
        'Code review and refactor existing projects for best practices'
      ]
    };

    const ideas = projectIdeas[focusRole] || projectIdeas.embedded;
    const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];

    return {
      id: `project_${Date.now()}`,
      type: 'project',
      duration: minutes,
      title: 'Project Work',
      description: randomIdea,
      role: focusRole,
      completed: false
    };
  }

  /**
   * Save daily plan to localStorage
   */
  saveDailyPlan(plan: DailyPlan) {
    const existingPlans = this.getDailyPlans();
    const todayPlanIndex = existingPlans.findIndex(p =>
      new Date(p.date).toDateString() === plan.date.toDateString()
    );

    if (todayPlanIndex >= 0) {
      existingPlans[todayPlanIndex] = plan;
    } else {
      existingPlans.push(plan);
    }

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filteredPlans = existingPlans.filter(p => new Date(p.date) >= thirtyDaysAgo);

    localStorage.setItem('dailyPlans', JSON.stringify(filteredPlans));
  }

  /**
   * Get saved daily plans
   */
  getDailyPlans(): DailyPlan[] {
    const saved = localStorage.getItem('dailyPlans');
    if (!saved) return [];

    const plans = JSON.parse(saved);
    return plans.map((plan: any) => ({
      ...plan,
      date: new Date(plan.date),
      created: new Date(plan.created),
      lastUpdated: new Date(plan.lastUpdated)
    }));
  }

  /**
   * Get today's plan
   */
  getTodaysPlan(): DailyPlan | null {
    const plans = this.getDailyPlans();
    const today = new Date().toDateString();
    return plans.find(plan => new Date(plan.date).toDateString() === today) || null;
  }

  /**
   * Mark a block as completed
   */
  completeBlock(planDate: Date, blockId: string) {
    const plans = this.getDailyPlans();
    const plan = plans.find(p => new Date(p.date).toDateString() === planDate.toDateString());

    if (plan) {
      const block = plan.blocks.find(b => b.id === blockId);
      if (block) {
        block.completed = true;
        block.endTime = new Date();
        plan.lastUpdated = new Date();
        this.saveDailyPlan(plan);
      }
    }
  }

  /**
   * Start a block (set start time)
   */
  startBlock(planDate: Date, blockId: string) {
    const plans = this.getDailyPlans();
    const plan = plans.find(p => new Date(p.date).toDateString() === planDate.toDateString());

    if (plan) {
      const block = plan.blocks.find(b => b.id === blockId);
      if (block) {
        block.startTime = new Date();
        plan.lastUpdated = new Date();
        this.saveDailyPlan(plan);
      }
    }
  }

  /**
   * Get planning suggestions for different time allocations
   */
  getPlanSuggestions() {
    return {
      '2hours': {
        hours: 2,
        allocation: { quizTimeRatio: 0.5, projectTimeRatio: 0.5 },
        description: '60m quiz, 60m project'
      },
      '3hours': {
        hours: 3,
        allocation: { quizTimeRatio: 0.4, projectTimeRatio: 0.6 },
        description: '70m quiz, 110m project'
      },
      '4hours': {
        hours: 4,
        allocation: { quizTimeRatio: 0.4, projectTimeRatio: 0.6 },
        description: '95m quiz, 145m project'
      },
      '5hours': {
        hours: 5,
        allocation: { quizTimeRatio: 0.35, projectTimeRatio: 0.65 },
        description: '105m quiz, 195m project'
      }
    };
  }

  private getRoleDisplayName(role: RoleType): string {
    const names = {
      embedded: 'Embedded/Firmware',
      swe: 'Software Engineering',
      ml_dl: 'ML/DL',
      genai: 'GenAI/LLM',
      coding: 'Coding Practice & DSA'
    };
    return names[role] || role;
  }

  private getDomainDisplayName(domain: string): string {
    // Convert snake_case to readable format
    return domain
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}