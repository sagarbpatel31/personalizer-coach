# Personalizer Coach

An AI-powered personalized coaching system for engineering career development, focusing on Embedded Software, Software Engineering, ML/DL, and GenAI roles.

## Features

### ✅ Implemented (v1.0)

- **Adaptive Quiz Engine**: Targets your weakest skills across all engineering domains
- **Daily Planner**: Flexible hour allocation with automatic time blocking
- **Skills Assessment**: Comprehensive taxonomy covering 4 major engineering roles
- **Progress Tracking**: Real-time rating updates and streak monitoring
- **Responsive UI**: Clean, modern interface built with Next.js and Tailwind CSS

### 🔄 In Progress

- Achievement and gamification system
- Application tracking dashboard
- Portfolio and blog management
- Personalized chatbot integration

## Technology Stack

- **Frontend**: Next.js 15.5.4 with Tailwind CSS v4
- **State Management**: Local storage with React hooks
- **Data**: JSON-based question bank and skills taxonomy
- **Quiz Engine**: Custom adaptive algorithm with Elo-style rating updates
- **Planning**: Dynamic time allocation based on skill gaps

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: http://localhost:3000

## How It Works

### Adaptive Quiz System

- Analyzes your skill ratings across 4 engineering roles
- Automatically selects questions targeting your weakest areas
- Updates ratings using smoothed scoring (20% weight to new results)
- Difficulty adjusts based on current skill level

### Daily Planning

- Generates personalized study blocks based on available time
- Automatically allocates time between applications, quizzing, and projects
- Focuses on highest-priority roles with lowest current ratings
- Tracks completion and provides streak metrics

### Skills Coverage

1. **Embedded/Firmware Engineering** (Priority 1)
   - C/C++ & Memory Management, RTOS/FreeRTOS
   - Communication Buses (I2C/SPI/UART), Linux Drivers & Device Tree
   - Debugging & Performance

2. **Software Engineering** (Priority 2)
   - Data Structures & Algorithms, System Design & APIs
   - Databases & Testing, DevOps & Cloud

3. **ML/DL & Autonomous Systems** (Priority 3)
   - Python Data Science Stack, Classical ML & Deep Learning
   - Computer Vision & PyTorch, Model Deployment & Tracking

4. **GenAI/LLM & Agentic AI** (Priority 4)
   - Transformers & Attention, LoRA/QLoRA Fine-tuning
   - RAG Systems & Embeddings, GPU Optimization & Safety

## Usage

### Daily Workflow
1. Set available study hours (flexible)
2. Generate personalized plan
3. Take adaptive quiz (targets weak areas)
4. Work on focused projects
5. Track applications

### NVIDIA GenAI Certification Prep

Includes targeted preparation for NVIDIA's GenAI and LLM certifications with hands-on projects and comprehensive coverage of transformers, fine-tuning, RAG systems, and GPU optimization.

## Development

Built with Next.js and TypeScript. Key components:
- `src/lib/quiz-engine.ts` - Adaptive questioning algorithm
- `src/lib/daily-planner.ts` - Time allocation and planning
- `public/data/` - Skills taxonomy and question bank

## Roadmap

- [ ] Achievement system with badges and XP
- [ ] Application tracking with auto-fill
- [ ] Portfolio website generator
- [ ] Real-time chatbot assistance
