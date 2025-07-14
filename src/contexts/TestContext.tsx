import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Question {
  id: string;
  number: number;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
}

interface TestData {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  questions: Question[];
}

interface TestProgress {
  answers: { [questionId: string]: number | null };
  markedForReview: string[];
  currentQuestion: number;
  timeRemaining: number;
  isCompleted: boolean;
}

interface TestContextType {
  currentTest: TestData | null;
  progress: TestProgress | null;
  loadTest: (testId: string) => void;
  saveAnswer: (questionId: string, answer: number) => void;
  toggleReview: (questionId: string) => void;
  goToQuestion: (questionNumber: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  pauseTest: () => void;
  resumeTest: () => void;
  submitTest: () => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

// Mock test data
const mockTests: { [key: string]: TestData } = {
  'week1-math': {
    id: 'week1-math',
    title: 'Mathematics - Week 1',
    subject: 'Mathematics',
    duration: 30,
    questions: [
      {
        id: '1',
        number: 1,
        question: 'Which of the following best defines an algorithm in programming?',
        choices: [
          'A step-by-step procedure to solve a problem',
          'A programming language',
          'A type of data structure',
          'A debugging tool'
        ],
        correctAnswer: 0,
        explanation: 'An algorithm is a step-by-step procedure or formula for solving a problem.'
      },
      {
        id: '2',
        number: 2,
        question: 'What is the time complexity of binary search?',
        choices: [
          'O(n)',
          'O(log n)',
          'O(n²)',
          'O(1)'
        ],
        correctAnswer: 1,
        explanation: 'Binary search has O(log n) time complexity as it divides the search space in half with each iteration.'
      },
      {
        id: '3',
        number: 3,
        question: 'Which data structure follows LIFO principle?',
        choices: [
          'Queue',
          'Array',
          'Stack',
          'Linked List'
        ],
        correctAnswer: 2,
        explanation: 'Stack follows Last In First Out (LIFO) principle where the last element added is the first one to be removed.'
      },
      {
        id: '4',
        number: 4,
        question: 'What is the result of 2³ + 3²?',
        choices: [
          '17',
          '13',
          '15',
          '19'
        ],
        correctAnswer: 0,
        explanation: '2³ = 8 and 3² = 9, so 8 + 9 = 17.'
      },
      {
        id: '5',
        number: 5,
        question: 'Which sorting algorithm has the best average-case time complexity?',
        choices: [
          'Bubble Sort',
          'Quick Sort',
          'Selection Sort',
          'Insertion Sort'
        ],
        correctAnswer: 1,
        explanation: 'Quick Sort has an average-case time complexity of O(n log n), making it one of the most efficient sorting algorithms.'
      }
    ]
  }
};

export const TestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTest, setCurrentTest] = useState<TestData | null>(null);
  const [progress, setProgress] = useState<TestProgress | null>(null);

  const loadTest = (testId: string) => {
    const test = mockTests[testId];
    if (test) {
      setCurrentTest(test);
      setProgress({
        answers: {},
        markedForReview: [],
        currentQuestion: 1,
        timeRemaining: test.duration * 60, // convert to seconds
        isCompleted: false
      });
    }
  };

  const saveAnswer = (questionId: string, answer: number) => {
    if (!progress) return;
    setProgress(prev => ({
      ...prev!,
      answers: { ...prev!.answers, [questionId]: answer }
    }));
  };

  const toggleReview = (questionId: string) => {
    if (!progress) return;
    setProgress(prev => ({
      ...prev!,
      markedForReview: prev!.markedForReview.includes(questionId)
        ? prev!.markedForReview.filter(id => id !== questionId)
        : [...prev!.markedForReview, questionId]
    }));
  };

  const goToQuestion = (questionNumber: number) => {
    if (!progress || !currentTest) return;
    if (questionNumber >= 1 && questionNumber <= currentTest.questions.length) {
      setProgress(prev => ({ ...prev!, currentQuestion: questionNumber }));
    }
  };

  const nextQuestion = () => {
    if (!progress || !currentTest) return;
    if (progress.currentQuestion < currentTest.questions.length) {
      setProgress(prev => ({ ...prev!, currentQuestion: prev!.currentQuestion + 1 }));
    }
  };

  const previousQuestion = () => {
    if (!progress) return;
    if (progress.currentQuestion > 1) {
      setProgress(prev => ({ ...prev!, currentQuestion: prev!.currentQuestion - 1 }));
    }
  };

  const pauseTest = () => {
    // In production, save state to backend
    console.log('Test paused');
  };

  const resumeTest = () => {
    // In production, restore state from backend
    console.log('Test resumed');
  };

  const submitTest = () => {
    if (!progress) return;
    setProgress(prev => ({ ...prev!, isCompleted: true }));
  };

  return (
    <TestContext.Provider value={{
      currentTest,
      progress,
      loadTest,
      saveAnswer,
      toggleReview,
      goToQuestion,
      nextQuestion,
      previousQuestion,
      pauseTest,
      resumeTest,
      submitTest
    }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};