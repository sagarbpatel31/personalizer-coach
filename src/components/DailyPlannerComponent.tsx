'use client';

import { useState, useEffect } from 'react';
import { DailyPlanner } from '@/lib/daily-planner';
import { DailyPlan, StudyBlock, RoleType } from '@/types';

interface DailyPlannerProps {
  plannerEngine: DailyPlanner;
  onExit: () => void;
}

export default function DailyPlannerComponent({ plannerEngine, onExit }: DailyPlannerProps) {
  const [availableHours, setAvailableHours] = useState(3);
  const [currentPlan, setCurrentPlan] = useState<DailyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [preferences, setPreferences] = useState({
    quizTimeRatio: 0.5,
    projectTimeRatio: 0.5
  });

  useEffect(() => {
    // Load today's plan if it exists
    const existingPlan = plannerEngine.getTodaysPlan();
    setCurrentPlan(existingPlan);
  }, [plannerEngine]);

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const userPriorities: RoleType[] = ['embedded', 'swe', 'ml_dl', 'genai', 'coding'];
      const plan = plannerEngine.generateDailyPlan(availableHours, userPriorities, preferences);
      plannerEngine.saveDailyPlan(plan);
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    }
    setIsGenerating(false);
  };

  const startBlock = (blockId: string) => {
    if (currentPlan) {
      plannerEngine.startBlock(currentPlan.date, blockId);
      // Refresh the plan
      const updatedPlan = plannerEngine.getTodaysPlan();
      setCurrentPlan(updatedPlan);
    }
  };

  const completeBlock = (blockId: string) => {
    if (currentPlan) {
      plannerEngine.completeBlock(currentPlan.date, blockId);
      // Refresh the plan
      const updatedPlan = plannerEngine.getTodaysPlan();
      setCurrentPlan(updatedPlan);
    }
  };

  const suggestions = plannerEngine.getPlanSuggestions();

  const getBlockIcon = (type: string) => {
    const icons = {
      quiz: '🧠',
      project: '🛠️',
      applications: '💼',
      study: '📚'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getBlockColor = (block: StudyBlock) => {
    if (block.completed) return 'bg-green-50 border-green-200';
    if (block.startTime) return 'bg-blue-50 border-blue-200';
    return 'bg-white border-gray-200';
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
              <h1 className="text-2xl font-bold text-gray-900">Daily Planner</h1>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Generator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Create Today's Plan</h2>

              {/* Hours Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Hours Today
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Quick Suggestions */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick Templates:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(suggestions).map(([key, suggestion]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setAvailableHours(suggestion.hours);
                        setPreferences(suggestion.allocation);
                      }}
                      className="p-2 text-sm border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300"
                    >
                      <div className="font-medium">{suggestion.hours}h</div>
                      <div className="text-xs text-gray-600">{suggestion.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization Toggle */}
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="text-sm text-blue-600 hover:text-blue-800 mb-4"
              >
                {showCustomization ? 'Hide' : 'Show'} Time Allocation Settings
              </button>

              {/* Customization Panel */}
              {showCustomization && (
                <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quiz/Study: {Math.round(preferences.quizTimeRatio * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="0.8"
                      step="0.05"
                      value={preferences.quizTimeRatio}
                      onChange={(e) => {
                        const newQuizRatio = parseFloat(e.target.value);
                        setPreferences({
                          quizTimeRatio: newQuizRatio,
                          projectTimeRatio: 1 - newQuizRatio
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Project Work: {Math.round(preferences.projectTimeRatio * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="0.8"
                      step="0.05"
                      value={preferences.projectTimeRatio}
                      onChange={(e) => {
                        const newProjectRatio = parseFloat(e.target.value);
                        setPreferences({
                          quizTimeRatio: 1 - newProjectRatio,
                          projectTimeRatio: newProjectRatio
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generatePlan}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isGenerating ? 'Generating...' : currentPlan ? 'Regenerate Plan' : 'Generate Plan'}
              </button>
            </div>

            {/* Progress Overview */}
            {currentPlan && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Completion</span>
                      <span>
                        {currentPlan.blocks.filter(b => b.completed).length}/{currentPlan.blocks.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(currentPlan.blocks.filter(b => b.completed).length / currentPlan.blocks.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Focus: {getRoleDisplayName(currentPlan.focus)}</p>
                    <p>Total Time: {currentPlan.totalHours}h</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plan Display */}
          <div className="lg:col-span-2">
            {currentPlan ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">Your Study Blocks</h2>
                  <div className="space-y-4">
                    {currentPlan.blocks.map((block) => (
                      <div
                        key={block.id}
                        className={`p-4 rounded-lg border-2 ${getBlockColor(block)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getBlockIcon(block.type)}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-gray-900">{block.title}</h3>
                                <span className="text-sm text-gray-500">({block.duration}m)</span>
                                {block.role && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {getRoleDisplayName(block.role)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{block.description}</p>
                              {block.startTime && !block.completed && (
                                <p className="text-xs text-blue-600">
                                  Started at {block.startTime.toLocaleTimeString()}
                                </p>
                              )}
                              {block.completed && block.endTime && (
                                <p className="text-xs text-green-600">
                                  Completed at {block.endTime.toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {!block.completed && !block.startTime && (
                              <button
                                onClick={() => startBlock(block.id)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Start
                              </button>
                            )}
                            {block.startTime && !block.completed && (
                              <button
                                onClick={() => completeBlock(block.id)}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Complete
                              </button>
                            )}
                            {block.completed && (
                              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                                ✓ Done
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Plan for Today</h2>
                <p className="text-gray-600 mb-6">
                  Set your available hours and generate a personalized study plan to get started.
                </p>
                <button
                  onClick={generatePlan}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700"
                >
                  Create Your First Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}