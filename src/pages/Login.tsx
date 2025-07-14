import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { auth as firebaseAuth, FirebaseService } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useFirebase, setUseFirebase] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (useFirebase) {
        // ✅ Firebase login
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const firebaseUser = userCredential.user;

        // ✅ Fetch or create profile
        let profile = await FirebaseService.getUserProfile(firebaseUser.uid);
        if (!profile) {
          await FirebaseService.createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Student',
            subscription: {
              plan: 'trial',
              status: 'trial',
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            },
            stats: {
              testsCompleted: 0,
              averageScore: 0,
              totalTime: 0,
              currentRank: 0,
              streak: 0,
            },
          });
          profile = await FirebaseService.getUserProfile(firebaseUser.uid);
        }

        if (profile) {
          setUser(profile); // ✅ Set full profile
        }

        toast.success('Signed in with Firebase!');
        navigate('/dashboard');

      } else {
        // ✅ Supabase login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setErrors({ general: 'Invalid email or password' });
          return;
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email!,
              full_name: authData.user.user_metadata?.full_name || 'Student',
              subscription_status: 'trial',
              subscription_plan: 'trial',
              total_tests_taken: 0,
              average_score: 0,
              current_rank: 0,
            })
            .select()
            .single();

          if (createError) {
            setErrors({ general: 'Failed to create user profile.' });
            return;
          }

          setUser(newProfile);
        } else {
          setUser(userProfile);
        }

        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ general: error?.message || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@examace.com');
    setPassword('demo123');

    setTimeout(() => {
      const demoUser = {
        id: 'demo-user',
        email: 'demo@examace.com',
        full_name: 'Demo Student',
        phone: '+91 9876543210',
        created_at: new Date().toISOString(),
        subscription_status: 'active' as const,
        subscription_plan: 'TGECET_Monthly',
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_tests_taken: 15,
        average_score: 78,
        current_rank: 247,
      };

      setUser(demoUser);
      toast.success('Welcome to the demo!');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="flex justify-center"
          >
            <div className="bg-blue-600 p-3 rounded-xl">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-600">Continue your TGECET & APECET preparation journey</p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-xl shadow-lg border space-y-6"
        >
          {errors.general && (
            <motion.div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 inset-y-0 flex items-center">
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-900">
              <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot your password?</Link>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : `Sign in with ${useFirebase ? 'Firebase' : 'Supabase'}`}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50"
            >
              Try Demo Account
            </motion.button>

            <div className="text-center text-sm">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={useFirebase}
                  onChange={(e) => setUseFirebase(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-600">Use Firebase Login</span>
              </label>
            </div>
          </div>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up for free</Link>
          </p>
        </motion.form>

        <motion.div className="text-center text-sm text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p className="mb-2">✨ Join 50,000+ students preparing for TGECET & APECET</p>
          <div className="flex justify-center space-x-6">
            <span>🎯 Real exam patterns</span>
            <span>📊 Detailed analytics</span>
            <span>🏆 Live leaderboards</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
