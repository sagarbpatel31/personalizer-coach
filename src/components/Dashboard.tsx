'use client';

import { useState, useEffect } from 'react';
import { QuizEngine } from '@/lib/quiz-engine';
import { DailyPlanner } from '@/lib/daily-planner';
import { RoleType, SkillsTaxonomy } from '@/types';

interface DashboardProps {
  quizEngine: QuizEngine;
  plannerEngine: DailyPlanner;
  onNavigate: (view: 'dashboard' | 'quiz' | 'planner' | 'history') => void;
}

export default function Dashboard({ quizEngine, plannerEngine, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [todaysPlan, setTodaysPlan] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [skillsTaxonomy, setSkillsTaxonomy] = useState<SkillsTaxonomy | null>(null);

  useEffect(() => {
    // Load progress stats
    const progressStats = quizEngine.getProgressStats();
    setStats(progressStats);

    // Load today's plan
    const plan = plannerEngine.getTodaysPlan();
    setTodaysPlan(plan);

    // Calculate streak (simplified for now)
    const plans = plannerEngine.getDailyPlans();
    const consecutiveDays = calculateConsecutiveDays(plans);
    setStreak(consecutiveDays);

    // Load skills taxonomy
    const loadTaxonomy = async () => {
      const response = await fetch('/data/skills_taxonomy.json');
      const taxonomy = await response.json();
      setSkillsTaxonomy(taxonomy);
    };
    loadTaxonomy();
  }, [quizEngine, plannerEngine]);

  const calculateConsecutiveDays = (plans: any[]) => {
    // Simple streak calculation - count days with completed blocks
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const dayPlan = plans.find(p =>
        new Date(p.date).toDateString() === checkDate.toDateString()
      );

      if (dayPlan && dayPlan.blocks.some((b: any) => b.completed)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getRoleColor = (role: RoleType) => {
    const colors = {
      embedded: 'bg-blue-500',
      swe: 'bg-green-500',
      ml_dl: 'bg-purple-500',
      genai: 'bg-orange-500',
      coding: 'bg-red-500'
    };
    return colors[role] || 'bg-gray-500';
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalizer Coach</h1>
        <p className="text-gray-600">Your AI-powered engineering career development companion</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? `${stats.overall.toFixed(1)}/10` : '---'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">{streak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">❓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Questions Answered</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? stats.questionsAnswered : '---'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Focus Today</p>
              <p className="text-lg font-bold text-gray-900">
                {todaysPlan ? getRoleDisplayName(todaysPlan.focus) : 'Not Set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('quiz')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🧠</span>
                <div>
                  <p className="font-medium">Take Adaptive Quiz</p>
                  <p className="text-sm text-gray-600">Challenge yourself with targeted questions</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('planner')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📅</span>
                <div>
                  <p className="font-medium">Plan Your Day</p>
                  <p className="text-sm text-gray-600">Create a personalized study schedule</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <p className="font-medium">Quiz History</p>
                  <p className="text-sm text-gray-600">Review your answers and track progress</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Role Progression</h3>
          {stats && stats.byRole ? (
            <div className="space-y-4">
              {Object.entries(stats.byRole).map(([role, score]) => (
                <div key={role}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{getRoleDisplayName(role as RoleType)}</span>
                    <span className="text-sm text-gray-600">{(score as number).toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRoleColor(role as RoleType)}`}
                      style={{ width: `${((score as number) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Take a quiz to see your progress</p>
          )}
        </div>
      </div>

      {/* Engineering Roles */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Engineering Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {skillsTaxonomy && Object.entries(skillsTaxonomy.roles).map(([roleKey, role]) => (
            <button
              key={roleKey}
              onClick={() => setSelectedRole(selectedRole === roleKey as RoleType ? null : roleKey as RoleType)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === roleKey
                  ? `${getRoleColor(roleKey as RoleType).replace('bg-', 'border-')} bg-opacity-10`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{role.name}</h4>
                <span className="text-sm text-gray-600">Priority {role.priority}</span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {Object.keys(role.domains).length} skill areas
              </div>
              {stats && stats.byRole && stats.byRole[roleKey] && (
                <div className="flex items-center">
                  <span className="text-sm font-medium">{(stats.byRole[roleKey] as number).toFixed(1)}/10</span>
                  <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRoleColor(roleKey as RoleType)}`}
                      style={{ width: `${((stats.byRole[roleKey] as number) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Role Skills Detail */}
        {selectedRole && skillsTaxonomy && (
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium mb-4">
              {skillsTaxonomy.roles[selectedRole].name} - Skills Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(skillsTaxonomy.roles[selectedRole].domains).map(([domainKey, domain]) => {
                const rating = quizEngine.getRating(selectedRole, domainKey);
                return (
                  <div key={domainKey} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{domain.name}</h5>
                      <span className="text-sm text-gray-600">{rating.mean.toFixed(1)}/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{domain.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          rating.mean < 4 ? 'bg-red-400' :
                          rating.mean < 7 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${(rating.mean / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {rating.n > 0 ? `${rating.n} questions answered` : 'Not assessed yet'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Today's Plan */}
      {todaysPlan && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Today's Plan ({todaysPlan.totalHours}h available)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todaysPlan.blocks.map((block: any) => (
              <div
                key={block.id}
                className={`p-4 rounded-lg border-2 ${
                  block.completed
                    ? 'bg-green-50 border-green-200'
                    : block.startTime
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{block.title}</h4>
                  <span className="text-sm text-gray-600">{block.duration}m</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{block.description}</p>
                {!block.completed && (
                  <button
                    onClick={() => plannerEngine.startBlock(todaysPlan.date, block.id)}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    {block.startTime ? 'Continue' : 'Start'}
                  </button>
                )}
                {block.completed && (
                  <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Areas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Areas for Improvement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizEngine.getWeakAreas(6).map((area) => (
            <div key={`${area.role}-${area.domain}`} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {getRoleDisplayName(area.role)}
                </span>
                <span className="text-sm text-gray-600">{area.rating.toFixed(1)}/10</span>
              </div>
              <p className="text-sm text-gray-600">
                {area.domain.split('_').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-red-400"
                  style={{ width: `${(area.rating / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}