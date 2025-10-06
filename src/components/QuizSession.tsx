'use client';

import { useState, useEffect } from 'react';
import { QuizEngine } from '@/lib/quiz-engine';
import { Question, QuizResult, RoleType } from '@/types';

interface QuizSessionProps {
  quizEngine: QuizEngine;
  onExit: () => void;
  practiceMode?: {
    role: RoleType;
    domain?: string;
  };
}

export default function QuizSession({ quizEngine, onExit, practiceMode }: QuizSessionProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sessionStartTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  const [confidence, setConfidence] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNextQuestion();
  }, []);

  const loadNextQuestion = () => {
    setIsLoading(true);
    let nextQuestion: Question | null = null;

    if (practiceMode) {
      // Use targeted practice mode
      nextQuestion = quizEngine.selectQuestionForPractice(practiceMode.role, practiceMode.domain);
    } else {
      // Use adaptive mode
      const userPriorities: RoleType[] = ['embedded', 'swe', 'ml_dl', 'genai', 'coding'];
      nextQuestion = quizEngine.selectNextQuestion(userPriorities);
    }

    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(new Date());
      setConfidence(3);
    }
    setIsLoading(false);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    const timeSpent = Date.now() - questionStartTime.getTime();

    const result: QuizResult = {
      questionId: currentQuestion.id,
      correct: isCorrect,
      timeSpent,
      confidence
    };

    // Update rating
    quizEngine.updateRating(result, currentQuestion, selectedAnswer, confidence);

    // Update session stats
    setQuestionsAnswered(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    loadNextQuestion();
  };

  const getRoleDisplayName = (role: RoleType) => {
    const names = {
      embedded: 'Embedded/Firmware',
      swe: 'Software Engineering',
      ml_dl: 'ML/DL & Autonomous',
      genai: 'GenAI/LLM',
      coding: 'Coding Practice & DSA'
    };
    return names[role] || role;
  };

  const getDomainDisplayName = (domain: string) => {
    return domain
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDifficultyColor = (difficulty: 1 | 2 | 3) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-red-100 text-red-800'
    };
    return colors[difficulty];
  };

  const getDifficultyLabel = (difficulty: 1 | 2 | 3) => {
    const labels = { 1: 'Basic', 2: 'Intermediate', 3: 'Advanced' };
    return labels[difficulty];
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading next question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onExit}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
              >
                ← Back to Dashboard
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              {practiceMode && (
                <>
                  <div className="text-sm font-medium text-blue-600">
                    Practice Mode: {getRoleDisplayName(practiceMode.role)}
                    {practiceMode.domain && ` - ${getDomainDisplayName(practiceMode.domain)}`}
                  </div>
                  <div className="h-6 border-l border-gray-300"></div>
                </>
              )}
              <div className="text-sm text-gray-600">
                Questions: {questionsAnswered} | Accuracy: {questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Session: {Math.round((Date.now() - sessionStartTime.getTime()) / 60000)}m
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getRoleDisplayName(currentQuestion.role)}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {getDomainDisplayName(currentQuestion.domain)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {getDifficultyLabel(currentQuestion.difficulty)}
              </span>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showExplanation && setSelectedAnswer(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showExplanation
                    ? index === currentQuestion.answer
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : index === selectedAnswer && index !== currentQuestion.answer
                      ? 'border-red-500 bg-red-50 text-red-900'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-sm text-gray-500 mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {showExplanation && index === currentQuestion.answer && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
                {showExplanation && index === selectedAnswer && index !== currentQuestion.answer && (
                  <span className="ml-2 text-red-600">✗</span>
                )}
              </button>
            ))}
          </div>

          {/* Confidence Slider (only show before answer) */}
          {!showExplanation && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How confident are you? (1 = Guessing, 5 = Very Sure)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Guessing</span>
                <span>Somewhat Sure</span>
                <span>Very Sure</span>
              </div>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Explanation:</h3>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {showExplanation && (
                <span>
                  {selectedAnswer === currentQuestion.answer ? '🎉 Correct!' : '❌ Incorrect'}
                </span>
              )}
            </div>

            <div className="space-x-3">
              {!showExplanation ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{questionsAnswered}</div>
            <div className="text-sm text-gray-600">Questions Answered</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}