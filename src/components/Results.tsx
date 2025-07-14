import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download,
  Share2,
  TrendingUp
} from 'lucide-react';

export const Results: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // Mock results data
  const results = {
    score: 85,
    totalQuestions: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    timeTaken: 1245, // seconds
    rank: 23,
    percentile: 78,
    subject: 'Mathematics',
    testTitle: 'Mathematics - Week 1'
  };

  const questionResults = [
    { id: '1', correct: true, userAnswer: 0, correctAnswer: 0, timeTaken: 45 },
    { id: '2', correct: true, userAnswer: 1, correctAnswer: 1, timeTaken: 67 },
    { id: '3', correct: false, userAnswer: 1, correctAnswer: 2, timeTaken: 89 },
    { id: '4', correct: true, userAnswer: 0, correctAnswer: 0, timeTaken: 52 },
    { id: '5', correct: true, userAnswer: 1, correctAnswer: 1, timeTaken: 38 }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-600 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Test Results</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${
                results.score >= 80 ? 'bg-green-100 text-green-600' :
                results.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}
            >
              {results.score}%
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{results.testTitle}</h2>
            <p className="text-gray-600">
              You scored {results.correctAnswers} out of {results.totalQuestions} questions correctly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-xl font-bold text-gray-900">{results.score}%</p>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Time Taken</p>
              <p className="text-xl font-bold text-gray-900">{formatTime(results.timeTaken)}</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Rank</p>
              <p className="text-xl font-bold text-gray-900">#{results.rank}</p>
            </div>
            <div className="text-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-600 font-bold text-sm">%</span>
              </div>
              <p className="text-sm text-gray-600">Percentile</p>
              <p className="text-xl font-bold text-gray-900">{results.percentile}th</p>
            </div>
          </div>
        </motion.div>

        {/* Question by Question Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Question Analysis</h3>
          
          <div className="space-y-4">
            {questionResults.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    question.correct ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {question.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Question {parseInt(question.id)}</p>
                    <p className="text-sm text-gray-600">
                      {question.correct ? 'Correct' : `Incorrect - Correct answer: Option ${question.correctAnswer + 1}`}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time: {formatTime(question.timeTaken)}</p>
                  <p className="text-sm text-gray-600">
                    Your answer: Option {question.userAnswer + 1}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate(`/test/${testId}`)}
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retake Test
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};