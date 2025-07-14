import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  score: number;
  time_taken_seconds: number;
  test_count: number;
  average_score: number;
  total_points: number;
  streak: number;
  badge?: string;
}

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [selectedExam, setSelectedExam] = useState<'ALL' | 'TGECET' | 'APECET'>('ALL');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod, selectedExam]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Generate mock leaderboard data for demonstration
      const mockData: LeaderboardEntry[] = Array.from({ length: 50 }, (_, index) => {
        const names = [
          'Arjun Reddy', 'Priya Sharma', 'Karthik Rao', 'Sneha Patel', 'Rahul Kumar',
          'Ananya Singh', 'Vikram Gupta', 'Pooja Nair', 'Aditya Joshi', 'Kavya Menon',
          'Rohan Das', 'Meera Iyer', 'Siddharth Shah', 'Divya Krishnan', 'Aryan Verma',
          'Riya Agarwal', 'Nikhil Pandey', 'Shreya Bansal', 'Akash Tiwari', 'Nisha Rao'
        ];
        
        const baseScore = Math.max(60, 100 - (index * 2) + Math.random() * 10);
        const testCount = Math.floor(Math.random() * 20) + 5;
        const streak = Math.floor(Math.random() * 15) + 1;
        
        return {
          rank: index + 1,
          user_id: `user_${index + 1}`,
          full_name: names[index % names.length] + (index >= names.length ? ` ${Math.floor(index / names.length) + 1}` : ''),
          score: Math.round(baseScore),
          time_taken_seconds: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
          test_count: testCount,
          average_score: Math.round(baseScore + Math.random() * 5 - 2.5),
          total_points: Math.floor(baseScore * testCount * 10),
          streak,
          badge: index < 3 ? ['👑', '🥈', '🥉'][index] : index < 10 ? '⭐' : undefined
        };
      });

      // Add current user to leaderboard if not present
      if (user) {
        const userEntry: LeaderboardEntry = {
          rank: Math.floor(Math.random() * 200) + 50,
          user_id: user.id,
          full_name: user.full_name,
          score: user.average_score || 75,
          time_taken_seconds: 1200,
          test_count: user.total_tests_taken || 8,
          average_score: user.average_score || 75,
          total_points: (user.average_score || 75) * (user.total_tests_taken || 8) * 10,
          streak: 5,
          badge: undefined
        };
        
        setUserRank(userEntry);
      }

      setLeaderboardData(mockData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return `bg-gradient-to-r ${
        rank === 1 ? 'from-yellow-400 to-yellow-600' :
        rank === 2 ? 'from-gray-300 to-gray-500' :
        'from-amber-400 to-amber-600'
      } text-white`;
    }
    if (rank <= 10) return 'bg-blue-100 text-blue-800';
    if (rank <= 50) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
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
                <h1 className="text-lg font-semibold text-gray-900">Leaderboard</h1>
                <p className="text-sm text-gray-600">Compete with top performers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="alltime">All Time</option>
              </select>
              
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Exams</option>
                <option value="TGECET">TGECET</option>
                <option value="APECET">APECET</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">50,247</p>
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
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{userRank?.rank || 'N/A'}</p>
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
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Score</p>
                <p className="text-2xl font-bold text-gray-900">{userRank?.average_score || 0}%</p>
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
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Points</p>
                <p className="text-2xl font-bold text-gray-900">{userRank?.total_points?.toLocaleString() || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">🏆 Top Performers</h3>
          
          <div className="flex justify-center items-end space-x-8">
            {/* 2nd Place */}
            {leaderboardData[1] && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-gray-300 to-gray-500 w-20 h-16 rounded-t-lg flex items-center justify-center mb-4">
                  <Medal className="h-8 w-8 text-white" />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 w-32">
                  <p className="font-bold text-gray-900">{leaderboardData[1].full_name}</p>
                  <p className="text-lg font-bold text-gray-600">{leaderboardData[1].score}%</p>
                  <p className="text-sm text-gray-500">{leaderboardData[1].test_count} tests</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {leaderboardData[0] && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-24 h-20 rounded-t-lg flex items-center justify-center mb-4">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 w-36 border-2 border-yellow-200">
                  <p className="font-bold text-gray-900">{leaderboardData[0].full_name}</p>
                  <p className="text-xl font-bold text-yellow-600">{leaderboardData[0].score}%</p>
                  <p className="text-sm text-gray-500">{leaderboardData[0].test_count} tests</p>
                  <div className="mt-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      👑 Champion
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboardData[2] && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-amber-400 to-amber-600 w-20 h-16 rounded-t-lg flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="bg-amber-50 rounded-lg p-4 w-32">
                  <p className="font-bold text-gray-900">{leaderboardData[2].full_name}</p>
                  <p className="text-lg font-bold text-amber-600">{leaderboardData[2].score}%</p>
                  <p className="text-sm text-gray-500">{leaderboardData[2].test_count} tests</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Complete Rankings</h3>
            <p className="text-sm text-gray-600">Updated every 6 hours</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboardData.slice(0, 20).map((entry, index) => (
                  <motion.tr
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`hover:bg-gray-50 transition-colors ${
                      entry.user_id === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankBadge(entry.rank)}`}>
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : <span className="text-sm font-bold">#{entry.rank}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          {entry.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {entry.full_name}
                            {entry.badge && <span className="ml-2">{entry.badge}</span>}
                            {entry.user_id === user?.id && (
                              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{entry.score}%</div>
                      <div className="text-xs text-gray-500">Avg: {entry.average_score}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.test_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(entry.time_taken_seconds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.total_points.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{entry.streak}</span>
                        <span className="ml-1 text-orange-500">🔥</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Full Leaderboard
            </button>
          </div>
        </motion.div>

        {/* Your Position (if not in top 20) */}
        {userRank && userRank.rank > 20 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Current Position</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  #{userRank.rank}
                </div>
                <div>
                  <p className="font-medium text-blue-900">{userRank.full_name}</p>
                  <p className="text-sm text-blue-700">
                    {userRank.score}% • {userRank.test_count} tests • {userRank.total_points.toLocaleString()} points
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Keep practicing to climb higher!</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Take More Tests
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};