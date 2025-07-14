import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Pause, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  Save,
  CheckCircle
} from 'lucide-react';
import { useTest } from '../contexts/TestContext';

export const TestInterface: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { currentTest, progress, loadTest, saveAnswer, toggleReview, goToQuestion, nextQuestion, previousQuestion, submitTest } = useTest();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);

  useEffect(() => {
    if (testId) {
      loadTest(testId);
    }
  }, [testId, loadTest]);

  useEffect(() => {
    if (progress) {
      setTimeRemaining(progress.timeRemaining);
    }
  }, [progress]);

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, timeRemaining, submitTest]);

  useEffect(() => {
    if (progress && currentTest) {
      const currentQuestion = currentTest.questions[progress.currentQuestion - 1];
      const savedAnswer = progress.answers[currentQuestion?.id];
      setSelectedAnswer(savedAnswer ?? null);
    }
  }, [progress?.currentQuestion, progress?.answers, currentTest]);

  if (!currentTest || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading test...</div>
      </div>
    );
  }

  const currentQuestion = currentTest.questions[progress.currentQuestion - 1];
  const totalQuestions = currentTest.questions.length;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionNumber: number) => {
    const question = currentTest.questions[questionNumber - 1];
    const isAnswered = progress.answers[question.id] !== undefined;
    const isMarked = progress.markedForReview.includes(question.id);
    const isCurrent = questionNumber === progress.currentQuestion;

    if (isCurrent) return 'current';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const getQuestionButtonClass = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-600 text-white border-blue-600';
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'marked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50';
    }
  };

  const handleSaveAndNext = () => {
    if (selectedAnswer !== null) {
      saveAnswer(currentQuestion.id, selectedAnswer);
      setTimeout(() => {
        if (progress.currentQuestion < totalQuestions) {
          nextQuestion();
        } else {
          submitTest();
          navigate(`/results/${testId}`);
        }
      }, 300);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const filteredQuestions = showOnlyMarked 
    ? currentTest.questions.filter(q => progress.markedForReview.includes(q.id))
    : currentTest.questions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-600 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{currentTest.title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
              
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Question Navigator */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">Question Navigator</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowOnlyMarked(!showOnlyMarked)}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                  showOnlyMarked 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Show Only Marked ({progress.markedForReview.length})
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(showOnlyMarked ? filteredQuestions : currentTest.questions).map((question, index) => {
              const questionNumber = showOnlyMarked 
                ? currentTest.questions.findIndex(q => q.id === question.id) + 1
                : index + 1;
              const status = getQuestionStatus(questionNumber);
              
              return (
                <motion.button
                  key={question.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToQuestion(questionNumber)}
                  className={`w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all ${getQuestionButtonClass(status)}`}
                >
                  {questionNumber}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={progress.currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">
                  Question {progress.currentQuestion} of {totalQuestions}
                </span>
                <button
                  onClick={() => toggleReview(currentQuestion.id)}
                  className={`flex items-center px-2 py-1 rounded text-sm transition-colors ${
                    progress.markedForReview.includes(currentQuestion.id)
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  Mark for Review
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Answer Choices */}
            <div className="space-y-3 mb-8">
              {currentQuestion.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{choice}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={progress.currentQuestion === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (selectedAnswer !== null) {
                  saveAnswer(currentQuestion.id, selectedAnswer);
                }
              }}
              disabled={selectedAnswer === null}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAndNext}
              disabled={selectedAnswer === null}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {progress.currentQuestion === totalQuestions ? 'Submit Test' : 'Save & Next'}
            </motion.button>
          </div>

          <button
            onClick={nextQuestion}
            disabled={progress.currentQuestion === totalQuestions}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-20"></div>
    </div>
  );
};