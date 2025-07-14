import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  BookOpen,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PerformanceData {
  date: string;
  score: number;
  timeTaken: number;
  subject: string;
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  testsCompleted: number;
  timeSpent: number;
  improvement: number;
}

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      if (!user) return;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Load test attempts
      const { data: attempts, error } = await supabase
        .from('test_attempts')
        .select(`
          *,
          test_series:test_series_id (
            title,
            subject,
            exam_type
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) throw error;

      // Process performance data
      const performance: PerformanceData[] = attempts?.map(attempt => ({
        date: new Date(attempt.completed_at).toLocaleDateString(),
        score: attempt.score,
        timeTaken: Math.round(attempt.time_taken_seconds / 60), // Convert to minutes
        subject: attempt.test_series?.subject || 'Unknown'
      })) || [];

      setPerformanceData(performance);

      // Process subject-wise data
      const subjectMap = new Map<string, {
        scores: number[];
        times: number[];
        count: number;
      }>();

      attempts?.forEach(attempt => {
        const subject = attempt.test_series?.subject || 'Unknown';
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { scores: [], times: [], count: 0 });
        }
        const data = subjectMap.get(subject)!;
        data.scores.push(attempt.score);
        data.times.push(attempt.time_taken_seconds);
        data.count++;
      });

      const subjects: SubjectPerformance[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
        subject,
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        testsCompleted: data.count,
        timeSpent: Math.round(data.times.reduce((a, b) => a + b, 0) / 3600), // Convert to hours
        improvement: Math.round(Math.random() * 20 - 10) // Mock improvement data
      }));

      setSubjectData(subjects);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const overallStats = {
    averageScore: performanceData.length > 0 
      ? Math.round(performanceData.reduce((sum, item) => sum + item.score, 0) / performanceData.length)
      : 0,
    totalTests: performanceData.length,
    totalTime: Math.round(performanceData.reduce((sum, item) => sum + item.timeTaken, 0) / 60), // Convert to hours
    improvement: performanceData.length > 1 
      ? performanceData[performanceData.length - 1].score - performanceData[0].score
      : 0
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 mr-3 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Performance Analytics</h1>
                <p className="text-sm text-gray-600">Track your progress and identify improvement areas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.averageScore}%</p>
                <p className={`text-sm ${overallStats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallStats.improvement >= 0 ? '+' : ''}{overallStats.improvement}% from first test
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Completed</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalTests}</p>
                <p className="text-sm text-gray-500">In selected period</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalTime}h</p>
                <p className="text-sm text-gray-500">Total practice time</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className={`text-2xl font-bold ${overallStats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallStats.improvement >= 0 ? '+' : ''}{overallStats.improvement}%
                </p>
                <p className="text-sm text-gray-500">Since first test</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance Trend</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-600">Score %</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subject-wise Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Subject-wise Performance</h3>
            
            <div className="space-y-6">
              {subjectData.map((subject, index) => (
                <div key={subject.subject} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                    <span className="text-lg font-bold text-blue-600">{subject.averageScore}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${subject.averageScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{subject.testsCompleted} tests</span>
                    <span>{subject.timeSpent}h studied</span>
                    <span className={subject.improvement >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {subject.improvement >= 0 ? '+' : ''}{subject.improvement}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Time Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Time Distribution by Subject</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="timeSpent"
                    label={({ subject, percent }) => `${subject} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {subjectData.map((subject, index) => (
                <div key={subject.subject} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-700">{subject.subject}</span>
                  </div>
                  <span className="font-medium text-gray-900">{subject.timeSpent}h</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-8 mt-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Recommendations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <Award className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Focus Area</h4>
              <p className="text-sm text-gray-600">
                {subjectData.length > 0 
                  ? `Spend more time on ${subjectData.sort((a, b) => a.averageScore - b.averageScore)[0]?.subject || 'practice'}`
                  : 'Take more tests to get personalized recommendations'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Study Schedule</h4>
              <p className="text-sm text-gray-600">
                Aim for 2-3 tests per week to maintain consistent improvement
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <Clock className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Time Management</h4>
              <p className="text-sm text-gray-600">
                Your average test time is good. Focus on accuracy over speed
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};