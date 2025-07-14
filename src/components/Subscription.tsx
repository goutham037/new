import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Award, BookOpen } from 'lucide-react';

export const Subscription: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'TGECET Complete',
      price: '₹99',
      period: '/month',
      description: 'Complete preparation for TGECET',
      features: [
        'All TGECET subjects (Math, Physics, Chemistry)',
        'Weekly mock tests',
        'Detailed analytics & performance reports',
        'Real-time leaderboard',
        'Downloadable PDF reports',
        'Expert explanations',
        'Mobile app access'
      ],
      popular: true,
      color: 'blue'
    },
    {
      name: 'APECET Complete',
      price: '₹99',
      period: '/month',
      description: 'Complete preparation for APECET',
      features: [
        'All APECET subjects (Math, Physics, Chemistry)',
        'Weekly mock tests',
        'Detailed analytics & performance reports',
        'Real-time leaderboard',
        'Downloadable PDF reports',
        'Expert explanations',
        'Mobile app access'
      ],
      popular: false,
      color: 'purple'
    },
    {
      name: 'Both Exams',
      price: '₹149',
      period: '/month',
      description: 'Prepare for both TGECET & APECET',
      features: [
        'All subjects for both TGECET & APECET',
        'Weekly mock tests for both exams',
        'Advanced analytics & insights',
        'Priority support',
        'Exclusive study materials',
        'Performance comparison tools',
        'Early access to new features'
      ],
      popular: false,
      color: 'green'
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Quick load times and smooth navigation'
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Expert Content',
      description: 'Questions crafted by subject matter experts'
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Comprehensive',
      description: 'Complete syllabus coverage with detailed explanations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">TGECET & APECET Prep</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Choose Your <span className="text-blue-600">Success Plan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Get unlimited access to premium mock tests, detailed analytics, and expert explanations. 
            Start your journey to engineering college today.
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className={`relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${
                plan.popular ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    plan.color === 'blue' ? 'bg-blue-100' :
                    plan.color === 'purple' ? 'bg-purple-100' :
                    'bg-green-100'
                  }`}>
                    <Crown className={`h-8 w-8 ${
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-colors ${
                    plan.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                    plan.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Start Free Trial
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">30-Day Money Back Guarantee</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Try our platform risk-free for 30 days. If you're not completely satisfied with your preparation 
            experience, we'll refund your subscription, no questions asked.
          </p>
        </motion.div>
      </div>
    </div>
  );
};