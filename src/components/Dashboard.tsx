'use client';

import { useState, useEffect } from 'react';
import { QuizEngine } from '@/lib/quiz-engine';
import { RoleType, SkillsTaxonomy } from '@/types';

interface DashboardProps {
  quizEngine: QuizEngine;
  onNavigate: (view: 'dashboard' | 'quiz' | 'history') => void;
}

export default function Dashboard({ quizEngine, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [skillsTaxonomy, setSkillsTaxonomy] = useState<SkillsTaxonomy | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    // Load progress stats
    const progressStats = quizEngine.getProgressStats();
    setStats(progressStats);

    // Load skills taxonomy
    const loadTaxonomy = async () => {
      const { getAssetPath } = await import('@/lib/utils');
      const response = await fetch(getAssetPath('/data/skills_taxonomy.json'));
      if (response.ok) {
        const taxonomy = await response.json();
        setSkillsTaxonomy(taxonomy);
      }
    };
    loadTaxonomy();
  }, [quizEngine]);

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

  const getDomainDisplayName = (domain: string) => {
    return domain
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Skills Mastery Dashboard</h1>
        <p className="text-gray-600">Your comprehensive engineering skills assessment and development platform</p>
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Skills Assessed</p>
              <p className="text-2xl font-bold text-gray-900">
                {skillsTaxonomy ? Object.values(skillsTaxonomy.roles).reduce((total, role) =>
                  total + Object.keys(role.domains).length, 0) : '---'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Skill Areas</p>
              <p className="text-2xl font-bold text-gray-900">
                {skillsTaxonomy ? Object.keys(skillsTaxonomy.roles).length : '---'}
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
              onClick={() => onNavigate('history')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <p className="font-medium">Review Quiz History</p>
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
        <h3 className="text-lg font-semibold mb-4">Engineering Specializations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {skillsTaxonomy && Object.entries(skillsTaxonomy.roles).map(([roleKey, role]) => (
            <button
              key={roleKey}
              onClick={() => {
                setSelectedRole(selectedRole === roleKey as RoleType ? null : roleKey as RoleType);
                setSelectedDomain(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedRole === roleKey
                  ? `${getRoleColor(roleKey as RoleType).replace('bg-', 'border-')} bg-opacity-10`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{role.name}</h4>
                <span className="text-sm text-gray-600">#{role.priority}</span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {Object.keys(role.domains).length} skill domains
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

        {/* Role Domains */}
        {selectedRole && skillsTaxonomy && (
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium mb-4">
              {skillsTaxonomy.roles[selectedRole].name} - Skill Domains
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(skillsTaxonomy.roles[selectedRole].domains).map(([domainKey, domain]) => {
                const rating = quizEngine.getRating(selectedRole, domainKey);
                return (
                  <button
                    key={domainKey}
                    onClick={() => setSelectedDomain(selectedDomain === domainKey ? null : domainKey)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedDomain === domainKey
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
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
                  </button>
                );
              })}
            </div>

            {/* Detailed Skills */}
            {selectedDomain && skillsTaxonomy.roles[selectedRole].domains[selectedDomain].skills && (
              <div className="border-t pt-6">
                <h5 className="text-lg font-medium mb-4">
                  {skillsTaxonomy.roles[selectedRole].domains[selectedDomain].name} - Detailed Skills
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skillsTaxonomy.roles[selectedRole].domains[selectedDomain].skills.map((skill, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 font-medium">•</span>
                        <span className="text-sm text-gray-800">{skill}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weak Areas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Priority Areas for Improvement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizEngine.getWeakAreas(6).map((area) => (
            <div key={`${area.role}-${area.domain}`} className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {getRoleDisplayName(area.role)}
                </span>
                <span className="text-sm text-red-600 font-medium">{area.rating.toFixed(1)}/10</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {getDomainDisplayName(area.domain)}
              </p>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${(area.rating / 10) * 100}%` }}
                ></div>
              </div>
              <button
                onClick={() => onNavigate('quiz')}
                className="mt-3 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
              >
                Practice This Area
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}