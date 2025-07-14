import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Flag,
  Save,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseQuestions } from '../hooks/useFirebaseQuestions';
import { FirebaseService, TestProgress, TestResult } from '../lib/firebase';
import toast from 'react-hot-toast';

export const TestInterface: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [examType, week, subject] = testId?.split('_') || [];
  const { questions, testSeries, loading: qsLoading, error } =
    useFirebaseQuestions(examType, week, subject);

  const [progress, setProgress] = useState<TestProgress>({
    testId: testId || '',
    userId: user?.uid || '',
    answers: {},
    markedForReview: [],
    currentQuestion: 1,
    timeRemaining: 0,
    startedAt: Date.now(),
    lastUpdated: Date.now(),
    isCompleted: false
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Create a question map for efficient lookup
  const questionMap = useMemo(() => {
    const map: Record<number, number> = {};
    questions.forEach((q, index) => {
      map[q.number] = index;
    });
    return map;
  }, [questions]);

  // 1. Initialize test only after auth & questions ready
  useEffect(() => {
    if (
      !authLoading &&
      !qsLoading &&
      testSeries &&
      questions.length > 0 &&
      user?.uid &&
      !initialized
    ) {
      initializeTest();
      setInitialized(true);
    }
  }, [authLoading, qsLoading, testSeries, questions, user, initialized]);

  // Initialize or resume test
  const initializeTest = async () => {
    if (!user?.uid || !testSeries || !testId) return;
    try {
      const existing = await FirebaseService.getTestProgress(user.uid, testId);
      if (existing && !existing.isCompleted) {
        setProgress({
          ...existing,
          timeRemaining: Math.max(
            0,
            existing.timeRemaining || testSeries.duration_minutes * 60
          )
        });
        toast.success('Resuming your previous test session');
      } else {
        const np: TestProgress = {
          testId,
          userId: user.uid,
          answers: {},
          markedForReview: [],
          currentQuestion: 1,
          timeRemaining: testSeries.duration_minutes * 60,
          startedAt: Date.now(),
          lastUpdated: Date.now(),
          isCompleted: false
        };
        setProgress(np);
        await FirebaseService.saveTestProgress(user.uid, testId, np);
        toast.success('Test started! Good luck!');
      }
    } catch (err) {
      console.error('Error initializing test:', err);
      toast.error('Failed to initialize test');
    }
  };

  // 2. Save progress with latest state
  const saveProgress = useCallback(async (currentProgress: TestProgress) => {
    if (!user?.uid || !testId || saving) return;
    setSaving(true);
    try {
      await FirebaseService.saveTestProgress(user.uid, testId, {
        ...currentProgress,
        lastUpdated: Date.now()
      });
    } catch (err) {
      console.error('Error saving progress:', err);
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  }, [user, testId, saving]);

  // 3. Auto-save every 30s
  useEffect(() => {
    if (initialized && !progress.isCompleted && user?.uid) {
      const iv = setInterval(() => saveProgress(progress), 30000);
      return () => clearInterval(iv);
    }
  }, [initialized, progress, progress.isCompleted, user, saveProgress]);

  // 4. Timer countdown
  useEffect(() => {
    if (!isPaused && progress.timeRemaining > 0 && !progress.isCompleted) {
      const timer = setInterval(() => {
        setProgress(prev => {
          const t = prev.timeRemaining - 1;
          if (t <= 0) {
            handleSubmitTest();
            return { ...prev, timeRemaining: 0, isCompleted: true };
          }
          return { ...prev, timeRemaining: t };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, progress.timeRemaining, progress.isCompleted]);

  // 5. Sync selectedAnswer when question changes
  useEffect(() => {
    if (questions.length && progress.currentQuestion <= questions.length) {
      const q = questions[progress.currentQuestion - 1];
      setSelectedAnswer(q ? progress.answers[q.number] ?? null : null);
    }
  }, [progress.currentQuestion, progress.answers, questions]);

  // Answer selection & saving
  const handleAnswerSelect = (n: number) => setSelectedAnswer(n);

  const handleSaveAnswer = async () => {
    if (selectedAnswer === null) return;
    const cq = questions[progress.currentQuestion - 1];
    if (!cq) return;
    
    const newAnswers = { ...progress.answers, [cq.number]: selectedAnswer };
    const newProgress = { ...progress, answers: newAnswers };
    
    setProgress(newProgress);
    await saveProgress(newProgress);
    toast.success('Answer saved!', { duration: 1000 });
  };

  const handleSaveAndNext = async () => {
    if (selectedAnswer === null) return;
    const cq = questions[progress.currentQuestion - 1];
    if (!cq) return;
    
    const newAnswers = { ...progress.answers, [cq.number]: selectedAnswer };
    const newProgress = { ...progress, answers: newAnswers };
    
    setProgress(newProgress);
    await saveProgress(newProgress);
    
    setTimeout(() => {
      if (progress.currentQuestion < questions.length) {
        goToQuestion(progress.currentQuestion + 1);
      } else {
        setShowSubmitConfirm(true);
      }
    }, 300);
  };

  const goToQuestion = (num: number) => {
    if (num >= 1 && num <= questions.length) {
      setProgress(prev => ({ ...prev, currentQuestion: num }));
    }
  };

  const toggleReview = async () => {
    const cq = questions[progress.currentQuestion - 1];
    if (!cq) return;
    
    const newMarked = progress.markedForReview.includes(cq.number)
      ? progress.markedForReview.filter(n => n !== cq.number)
      : [...progress.markedForReview, cq.number];
    
    const newProgress = { ...progress, markedForReview: newMarked };
    
    setProgress(newProgress);
    await saveProgress(newProgress);
    toast.success('Review status updated!', { duration: 1000 });
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!user?.uid || !testSeries || !testId) return;
    try {
      let correct = 0;
      questions.forEach(q => {
        if (progress.answers[q.number] === q.correct_answer) correct++;
      });
      const score = Math.round((correct / questions.length) * 100);
      const result: TestResult = {
        testId,
        userId: user.uid,
        score,
        correctAnswers: correct,
        totalQuestions: questions.length,
        timeTaken:
          testSeries.duration_minutes * 60 - progress.timeRemaining,
        answers: progress.answers,
        completedAt: Date.now()
      };
      await FirebaseService.saveTestResult(user.uid, testId, result);
      setProgress(prev => ({ ...prev, isCompleted: true }));
      toast.success(`Test completed! You scored ${score}%`);
      navigate(`/results/${testId}/latest`);
    } catch (err) {
      console.error('Error submitting test:', err);
      toast.error('Failed to submit test');
    }
  };

  // Formatting & counts
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(progress.answers || {}).length;
  const markedCount = progress.markedForReview.length;
  const currentQuestion = questions[progress.currentQuestion - 1];

  // Render loading / error screens
  if (authLoading || qsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (error || !testSeries || !questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">
          {error || "Test not found or no questions available."}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">Invalid question index.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <Home className="h-5 w-5" />
            </button>
            <div className="ml-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {testSeries.title}
              </h1>
              <p className="text-sm text-gray-600">
                {testSeries.subject} • {testSeries.exam_type}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>
                {answeredCount}/{questions.length}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Flag className="h-5 w-5 text-yellow-600" />
              <span>{markedCount}</span>
            </div>
            {saving && (
              <div className="flex items-center space-x-1 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span className="text-xs">Saving...</span>
              </div>
            )}
            <div
              className={`flex items-center px-3 py-1 font-mono rounded-lg ${
                progress.timeRemaining < 300
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTime(progress.timeRemaining)}</span>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center px-3 py-1 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigator */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-sm font-medium text-gray-700">
              Question Navigator
            </h2>
            <button
              onClick={() => setShowOnlyMarked(!showOnlyMarked)}
              className={`flex items-center text-sm px-2 py-1 rounded-lg transition ${
                showOnlyMarked
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showOnlyMarked ? (
                <Eye className="h-4 w-4 mr-1" />
              ) : (
                <EyeOff className="h-4 w-4 mr-1" />
              )}
              Marked Only ({markedCount})
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {progress.currentQuestion} of {questions.length}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => {
              const position = index + 1;
              const answered = progress.answers[q.number] !== undefined;
              const marked = progress.markedForReview.includes(q.number);
              const current = progress.currentQuestion === position;
              
              // Skip if we're in marked-only mode and it's not marked
              if (showOnlyMarked && !marked) return null;
              
              let cls = 'bg-white text-gray-600 border-gray-300';
              if (current) {
                cls = 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200';
              } else if (marked && answered) {
                cls = 'bg-orange-100 text-orange-800 border-orange-300';
              } else if (marked) {
                cls = 'bg-yellow-100 text-yellow-800 border-yellow-300';
              } else if (answered) {
                cls = 'bg-green-100 text-green-800 border-green-300';
              }
              
              return (
                <button
                  key={`${q.number}-${position}`}
                  onClick={() => goToQuestion(position)}
                  className={`w-8 h-8 rounded-lg border-2 font-medium ${cls} hover:scale-105 transition`}
                >
                  {q.number}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Question */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={progress.currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"
          >
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestion.number} of {questions.length}
                </span>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {testSeries.subject}
                </div>
              </div>
              <button
                onClick={toggleReview}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                  progress.markedForReview.includes(currentQuestion.number)
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Flag className="h-4 w-4 mr-1" />
                {progress.markedForReview.includes(currentQuestion.number)
                  ? 'Marked'
                  : 'Mark for Review'}
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <h3 className="text-lg md:text-xl font-medium text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Choices */}
            <div className="space-y-4 mb-8">
              {Object.entries(currentQuestion.choices).map(
                ([key, text]) => {
                  const idx = parseInt(key, 10);
                  const isSel = selectedAnswer === idx;
                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition ${
                        isSel
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition ${
                            isSel
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        </div>
                        <span className="text-gray-900">{text}</span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => goToQuestion(progress.currentQuestion - 1)}
              disabled={progress.currentQuestion === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <button
              onClick={() => goToQuestion(progress.currentQuestion + 1)}
              disabled={progress.currentQuestion === questions.length}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition sm:hidden"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
            <button
              onClick={handleSaveAnswer}
              disabled={selectedAnswer === null || saving}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </button>

            <button
              onClick={handleSaveAndNext}
              disabled={selectedAnswer === null || saving}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {progress.currentQuestion === questions.length
                ? 'Submit Test'
                : 'Save & Next'}
            </button>
          </div>

          <button
            onClick={() => goToQuestion(progress.currentQuestion + 1)}
            disabled={progress.currentQuestion === questions.length}
            className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Submit Test?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your test? You have answered{' '}
              {answeredCount} out of {questions.length} questions.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Submit Test
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Spacer for footer */}
      <div className="h-20"></div>
    </div>
  );
};