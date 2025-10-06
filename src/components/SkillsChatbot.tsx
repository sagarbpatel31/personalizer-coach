'use client';

import { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SkillsChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SkillsChatbot({ isOpen, onToggle }: SkillsChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI skills coach. I can help you:\n\n• Plan your learning path for specific roles\n• Suggest next skills to focus on\n• Recommend study resources\n• Answer questions about engineering careers\n• Help prioritize skill development\n\nWhat would you like to know about your engineering journey?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const skillsAdvice = {
    embedded: {
      beginner: "Start with C fundamentals, then move to microcontroller basics. Focus on understanding pointers and memory management first.",
      intermediate: "Dive deeper into RTOS concepts, learn FreeRTOS, and practice with different communication protocols like I2C and SPI.",
      advanced: "Master Linux kernel development, device drivers, and advanced debugging techniques with JTAG and logic analyzers."
    },
    swe: {
      beginner: "Build strong foundations in data structures and algorithms. Practice on LeetCode and understand system design basics.",
      intermediate: "Learn cloud technologies, microservices architecture, and get hands-on with Docker and Kubernetes.",
      advanced: "Focus on distributed systems, advanced system design, and leading technical teams effectively."
    },
    ml_dl: {
      beginner: "Start with Python data science stack (NumPy, Pandas), learn statistics, and practice with simple ML models.",
      intermediate: "Dive into deep learning with PyTorch, work on computer vision projects, and learn MLOps practices.",
      advanced: "Specialize in areas like transformers, research papers implementation, and production ML systems at scale."
    },
    genai: {
      beginner: "Understand transformer architecture, learn prompt engineering, and experiment with OpenAI APIs.",
      intermediate: "Practice fine-tuning models with LoRA, build RAG systems, and learn about embeddings and vector databases.",
      advanced: "Master multi-agent systems, develop custom training pipelines, and focus on AI safety and alignment."
    },
    coding: {
      beginner: "Master basic data structures (arrays, lists, stacks, queues) and fundamental algorithms (sorting, searching).",
      intermediate: "Practice advanced algorithms, dynamic programming patterns, and participate in coding contests.",
      advanced: "Focus on system design implementation, optimize for performance, and mentor others in algorithmic thinking."
    }
  };

  const getSkillAdvice = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Role-specific advice
    if (lowerQuery.includes('embedded') || lowerQuery.includes('firmware')) {
      if (lowerQuery.includes('beginner') || lowerQuery.includes('start')) {
        return skillsAdvice.embedded.beginner;
      } else if (lowerQuery.includes('advanced')) {
        return skillsAdvice.embedded.advanced;
      } else {
        return skillsAdvice.embedded.intermediate;
      }
    }

    if (lowerQuery.includes('software engineer') || lowerQuery.includes('swe') || lowerQuery.includes('backend') || lowerQuery.includes('fullstack')) {
      if (lowerQuery.includes('beginner') || lowerQuery.includes('start')) {
        return skillsAdvice.swe.beginner;
      } else if (lowerQuery.includes('advanced')) {
        return skillsAdvice.swe.advanced;
      } else {
        return skillsAdvice.swe.intermediate;
      }
    }

    if (lowerQuery.includes('ml') || lowerQuery.includes('machine learning') || lowerQuery.includes('data science') || lowerQuery.includes('ai')) {
      if (lowerQuery.includes('beginner') || lowerQuery.includes('start')) {
        return skillsAdvice.ml_dl.beginner;
      } else if (lowerQuery.includes('advanced')) {
        return skillsAdvice.ml_dl.advanced;
      } else {
        return skillsAdvice.ml_dl.intermediate;
      }
    }

    if (lowerQuery.includes('genai') || lowerQuery.includes('llm') || lowerQuery.includes('gpt') || lowerQuery.includes('transformer')) {
      if (lowerQuery.includes('beginner') || lowerQuery.includes('start')) {
        return skillsAdvice.genai.beginner;
      } else if (lowerQuery.includes('advanced')) {
        return skillsAdvice.genai.advanced;
      } else {
        return skillsAdvice.genai.intermediate;
      }
    }

    if (lowerQuery.includes('coding') || lowerQuery.includes('algorithm') || lowerQuery.includes('dsa') || lowerQuery.includes('leetcode')) {
      if (lowerQuery.includes('beginner') || lowerQuery.includes('start')) {
        return skillsAdvice.coding.beginner;
      } else if (lowerQuery.includes('advanced')) {
        return skillsAdvice.coding.advanced;
      } else {
        return skillsAdvice.coding.intermediate;
      }
    }

    // General advice based on keywords
    if (lowerQuery.includes('next') || lowerQuery.includes('what should')) {
      return "Based on your current skills assessment, I'd recommend focusing on your weakest areas first. Check the 'Priority Areas for Improvement' section on your dashboard to see which skills need attention. Would you like specific advice for any particular role?";
    }

    if (lowerQuery.includes('career') || lowerQuery.includes('job') || lowerQuery.includes('interview')) {
      return "For career advancement, focus on: 1) Strengthening your core technical skills, 2) Building projects that demonstrate your abilities, 3) Practicing system design and coding interviews, 4) Contributing to open source, and 5) Networking with professionals in your field. Which area would you like to explore further?";
    }

    if (lowerQuery.includes('resource') || lowerQuery.includes('learn') || lowerQuery.includes('study')) {
      return "Great learning resources include: Online courses (Coursera, Udemy), Technical books, GitHub projects, Documentation and tutorials, Coding practice platforms (LeetCode, HackerRank), and YouTube channels by experts. What specific topic are you looking to learn?";
    }

    if (lowerQuery.includes('time') || lowerQuery.includes('schedule') || lowerQuery.includes('plan')) {
      return "For effective skill development: 1) Set aside consistent daily practice (30-60 min), 2) Use the 80/20 rule (80% practice, 20% theory), 3) Focus on one skill area at a time, 4) Take regular quizzes to track progress, 5) Build practical projects. What's your current time availability for learning?";
    }

    // Default response
    return "I can help you with skill development advice! Try asking me about:\n\n• 'What should I focus on for [role] development?'\n• 'How do I improve my [specific skill]?'\n• 'What resources do you recommend for [topic]?'\n• 'How should I plan my learning schedule?'\n\nWhat specific area would you like guidance on?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getSkillAdvice(inputValue),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <span className="text-2xl">🤖</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center">
          <span className="text-xl mr-2">🤖</span>
          <h3 className="font-semibold">Skills AI Coach</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about skills, career advice, learning paths..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}