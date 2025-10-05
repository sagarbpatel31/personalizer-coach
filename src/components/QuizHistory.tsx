'use client';

import { useState, useEffect } from 'react';
import { QuizEngine } from '@/lib/quiz-engine';
import { QuizHistoryEntry, RoleType } from '@/types';

interface QuizHistoryProps {
  quizEngine: QuizEngine;
  onExit: () => void;
}

export default function QuizHistory({ quizEngine, onExit }: QuizHistoryProps) {
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<QuizHistoryEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    role: '' as RoleType | '',
    correct: '' as 'true' | 'false' | '',
    limit: 50
  });

  useEffect(() => {
    const allHistory = quizEngine.getQuizHistory();
    const quizStats = quizEngine.getQuizStats();

    setHistory(allHistory);
    setStats(quizStats);
    applyFilters(allHistory);
  }, [quizEngine]);

  useEffect(() => {
    applyFilters(history);
  }, [filters, history]);

  const applyFilters = (historyData: QuizHistoryEntry[]) => {
    let filtered = [...historyData];

    if (filters.role) {
      filtered = filtered.filter(entry => entry.question.role === filters.role);
    }

    if (filters.correct) {
      const isCorrect = filters.correct === 'true';
      filtered = filtered.filter(entry => entry.correct === isCorrect);
    }

    filtered = filtered.slice(0, filters.limit);
    setFilteredHistory(filtered);
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

  const formatTime = (ms: number) => {
    return `${Math.round(ms / 1000)}s`;
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all quiz history? This cannot be undone.')) {
      localStorage.removeItem('quizHistory');
      setHistory([]);
      setFilteredHistory([]);
      setStats(quizEngine.getQuizStats());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
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
              <h1 className="text-2xl font-bold text-gray-900">Quiz History</h1>
            </div>
            <button
              onClick={clearHistory}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.averageTime}s</div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.averageConfidence}</div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.streakCount}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as RoleType | '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="embedded">Embedded/Firmware</option>
                <option value="swe">Software Engineering</option>
                <option value="ml_dl">ML/DL & Autonomous</option>
                <option value="genai">GenAI/LLM</option>
                <option value="coding">Coding Practice & DSA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
              <select
                value={filters.correct}
                onChange={(e) => setFilters(prev => ({ ...prev, correct: e.target.value as 'true' | 'false' | '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Results</option>
                <option value="true">Correct Only</option>
                <option value="false">Incorrect Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={25}>Last 25</option>
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={500}>All</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ role: '', correct: '', limit: 50 })}
                className="w-full px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            Quiz History ({filteredHistory.length} {filteredHistory.length === 1 ? 'question' : 'questions'})
          </h3>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quiz History</h3>
              <p className="text-gray-600">Take some quizzes to see your progress here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border-2 ${
                    entry.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getRoleDisplayName(entry.question.role)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getDomainDisplayName(entry.question.domain)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(entry.question.difficulty)}`}>
                        {getDifficultyLabel(entry.question.difficulty)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleString()}
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-3">{entry.question.question}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                      <div className="space-y-1">
                        {entry.question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`text-sm p-2 rounded ${
                              index === entry.question.answer
                                ? 'bg-green-100 text-green-800 font-medium'
                                : index === entry.userAnswer
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                            {index === entry.question.answer && <span className="ml-2">✓</span>}
                            {index === entry.userAnswer && index !== entry.question.answer && <span className="ml-2">✗</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Details:</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Your Answer:</span> {String.fromCharCode(65 + entry.userAnswer)} - {entry.question.options[entry.userAnswer]}
                        </div>
                        <div>
                          <span className="font-medium">Correct Answer:</span> {String.fromCharCode(65 + entry.question.answer)} - {entry.question.options[entry.question.answer]}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {formatTime(entry.timeSpent)}
                        </div>
                        <div>
                          <span className="font-medium">Confidence:</span> {entry.confidence}/5
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-800">{entry.question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}