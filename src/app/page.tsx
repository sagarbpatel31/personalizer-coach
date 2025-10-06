'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import QuizSession from '@/components/QuizSession';
import QuizHistory from '@/components/QuizHistory';
import SkillsChatbot from '@/components/SkillsChatbot';
import { QuizEngine } from '@/lib/quiz-engine';
import { RoleType } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'quiz' | 'history'>('dashboard');
  const [quizEngine, setQuizEngine] = useState<QuizEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState<{role: RoleType, domain?: string} | null>(null);

  const handleStartPractice = (role: RoleType, domain?: string) => {
    setPracticeMode({ role, domain });
    setCurrentView('quiz');
  };

  const handleExitQuiz = () => {
    setPracticeMode(null);
    setCurrentView('dashboard');
  };

  useEffect(() => {
    const initializeEngines = async () => {
      try {
        const quiz = new QuizEngine();
        await quiz.initialize();

        setQuizEngine(quiz);
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

  if (!quizEngine) {
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
          onNavigate={setCurrentView}
          onStartPractice={handleStartPractice}
        />
      )}

      {currentView === 'quiz' && (
        <QuizSession
          quizEngine={quizEngine}
          onExit={handleExitQuiz}
          practiceMode={practiceMode}
        />
      )}

      {currentView === 'history' && (
        <QuizHistory
          quizEngine={quizEngine}
          onExit={() => setCurrentView('dashboard')}
        />
      )}

      {/* AI Skills Chatbot */}
      <SkillsChatbot
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
    </div>
  );
}
