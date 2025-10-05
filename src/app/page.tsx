'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import QuizSession from '@/components/QuizSession';
import DailyPlanner from '@/components/DailyPlannerComponent';
import { QuizEngine } from '@/lib/quiz-engine';
import { DailyPlanner as PlannerEngine } from '@/lib/daily-planner';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'quiz' | 'planner'>('dashboard');
  const [quizEngine, setQuizEngine] = useState<QuizEngine | null>(null);
  const [plannerEngine, setPlannerEngine] = useState<PlannerEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeEngines = async () => {
      try {
        const quiz = new QuizEngine();
        await quiz.initialize();
        const planner = new PlannerEngine(quiz);

        setQuizEngine(quiz);
        setPlannerEngine(planner);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize engines:', error);
        setIsLoading(false);
      }
    };

    initializeEngines();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Initializing Personalizer Coach...</h2>
          <p className="text-gray-600">Loading your personalized learning engine</p>
        </div>
      </div>
    );
  }

  if (!quizEngine || !plannerEngine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Failed to Initialize</h2>
          <p className="text-gray-600">Please refresh the page to try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && (
        <Dashboard
          quizEngine={quizEngine}
          plannerEngine={plannerEngine}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'quiz' && (
        <QuizSession
          quizEngine={quizEngine}
          onExit={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'planner' && (
        <DailyPlanner
          plannerEngine={plannerEngine}
          onExit={() => setCurrentView('dashboard')}
        />
      )}
    </div>
  );
}
