import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Award, 
  BookOpen, 
  User, 
  Settings, 
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Trophy,
  Zap,
  ChevronRight,
  Star,
  Bell,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAllTestSeries } from '../hooks/useFirebaseQuestions';
import { FirebaseService } from '../lib/firebase';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { testSeries, loading, error } = useAllTestSeries();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<'ALL' | 'TGECET' | 'APECET' | 'Target48'>('ALL');
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTests = testSeries.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'ALL' || test.exam_type === selectedExam;
    const matchesWeek = selectedWeek === 'ALL' || test.week === selectedWeek;
    return matchesSearch && matchesExam && matchesWeek;
  });

  // Get unique weeks for filter
  const availableWeeks = ['ALL', ...Array.from(new Set(testSeries.map(test => test.week)))];

  const getSubjectColor = (subject: string) => {
    const colors = {
      'C,DS & CPP': 'bg-blue-100 text-blue-800 border-blue-200',
      'Mathematics': 'bg-green-100 text-green-800 border-green-200',
      'Physics': 'bg-purple-100 text-purple-800 border-purple-200',
      'Chemistry': 'bg-orange-100 text-orange-800 border-orange-200',
      'English': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartTest = (testId: string) => {
    navigate(`/test/${testId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">ExamAce</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-medium">{user?.displayName || 'Student'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Ready to excel today? 🚀
                </h2>
                <p className="text-blue-100 mb-4 md:mb-0">
                  You're on a {user?.stats?.streak || 0}-day streak! Keep the momentum going.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  View Leaderboard
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center"
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1"
          >
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Tests</p>
                <p className="text-xl font-bold text-gray-900">{user?.stats?.testsCompleted || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1"
          >
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Score</p>
                <p className="text-xl font-bold text-gray-900">{user?.stats?.averageScore || 0}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Time</p>
                <p className="text-xl font-bold text-gray-900">{Math.round((user?.stats?.totalTime || 0) / 3600)}h</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1"
          >
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Rank</p>
                <p className="text-xl font-bold text-gray-900">#{user?.stats?.currentRank || 'N/A'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1"
          >
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Weekly</p>
                <p className="text-xl font-bold text-gray-900">#-</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1"
          >
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Streak</p>
                <p className="text-xl font-bold text-gray-900">{user?.stats?.streak || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1"
          >
            <div className="flex items-center">
              <Star className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Points</p>
                <p className="text-xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['ALL', 'TGECET', 'APECET', 'Target48'].map((exam) => (
              <button
                key={exam}
                onClick={() => setSelectedExam(exam as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedExam === exam
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {exam}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableWeeks.map(week => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Tests ({filteredTests.length})</h2>
            <button
              onClick={() => navigate('/subscription')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Upgrade to Premium
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group ${
                  viewMode === 'list' ? 'flex items-center p-6' : 'p-6'
                }`}
              >
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSubjectColor(test.subject)}`}>
                      {test.subject}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty_level)}`}>
                        {test.difficulty_level}
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {test.exam_type}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {test.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Complete {test.subject} practice test with {test.total_questions} questions
                  </p>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-6">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{test.duration_minutes} min</span>
                    <span className="mx-2">•</span>
                    <span>{test.total_questions} questions</span>
                    <span className="mx-2">•</span>
                    <span className="text-blue-600 font-medium">{test.week}</span>
                  </div>
                </div>
                
                <div className={viewMode === 'list' ? 'ml-6' : ''}>
                  <button
                    onClick={() => handleStartTest(test.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors group"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Test
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredTests.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};