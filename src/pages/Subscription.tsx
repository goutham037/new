import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Award, BookOpen, ArrowLeft, Star, Shield, Clock, Users } from 'lucide-react';
import { getSubscriptionPlans, initiatePayment, verifyPayment } from '../lib/razorpay';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = getSubscriptionPlans();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Quick load times and smooth navigation for uninterrupted practice"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Expert Content",
      description: "Questions crafted by subject matter experts with detailed explanations"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with automatic progress saving"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Learning",
      description: "Join thousands of students and compete on live leaderboards"
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe');
      navigate('/login');
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setLoading(planId);
    setSelectedPlan(planId);

    try {
      const paymentData = await initiatePayment({
        amount: plan.price * 100, // Convert to paise
        currency: 'INR',
        planType: plan.id,
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
        userPhone: user.phone
      });

      // Verify payment
      await verifyPayment({
        ...paymentData,
        userId: user.id,
        planType: plan.id
      });

      toast.success('Subscription activated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      if (error instanceof Error && error.message !== 'Payment cancelled by user') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setLoading(null);
      setSelectedPlan(null);
    }
  };

  const getPlanColor = (planId: string) => {
    if (planId.includes('TGECET')) return 'blue';
    if (planId.includes('APECET')) return 'purple';
    return 'green';
  };

  const getColorClasses = (color: string, isPopular: boolean = false) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        button: isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
        border: 'border-blue-500'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        button: isPopular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700',
        border: 'border-purple-500'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        button: isPopular ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700',
        border: 'border-green-500'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 mr-3 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">ExamAce</h1>
            </div>
            <div className="text-sm text-gray-600">
              Choose your plan
            </div>
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
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Get unlimited access to premium mock tests, detailed analytics, and expert explanations. 
            Start your journey to engineering college today.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-8 text-sm text-gray-600"
          >
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              7-day free trial
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              Secure payments
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const color = getPlanColor(plan.id);
            const colorClasses = getColorClasses(color, plan.id.includes('Both'));
            const isPopular = plan.id.includes('Both') && plan.duration === 'month';
            const isYearly = plan.duration === 'year';
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className={`relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${
                  isPopular ? colorClasses.border : 'border-gray-200'
                } hover:shadow-xl transition-shadow`}
              >
                {isPopular && (
                  <div className={`absolute top-0 left-0 right-0 ${colorClasses.button} text-white text-center py-2 text-sm font-medium`}>
                    Most Popular
                  </div>
                )}
                
                {isYearly && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Save ₹{plan.originalPrice! - plan.price}
                  </div>
                )}
                
                <div className={`p-8 ${isPopular ? 'pt-16' : ''}`}>
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${colorClasses.bg}`}>
                      <Crown className={`h-8 w-8 ${colorClasses.text}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                      <span className="text-gray-600 ml-1">/{plan.duration}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-gray-500">
                        <span className="line-through">₹{plan.originalPrice}</span>
                        <span className="ml-2 text-green-600 font-medium">
                          Save {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                        </span>
                      </div>
                    )}
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
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses.button}`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Start Free Trial'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What Our Students Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Arjun Reddy",
                college: "JNTU Hyderabad",
                score: "AIR 23",
                text: "ExamAce helped me identify my weak areas and improve systematically. The mock tests were exactly like the real exam!",
                rating: 5
              },
              {
                name: "Priya Sharma",
                college: "CBIT Hyderabad",
                score: "AIR 45",
                text: "The detailed analytics and performance tracking made all the difference. I could see my progress week by week.",
                rating: 5
              },
              {
                name: "Karthik Rao",
                college: "VNIT Nagpur",
                score: "AIR 78",
                text: "The leaderboard feature kept me motivated. Competing with other students pushed me to perform better.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.college}</p>
                  <p className="text-sm font-medium text-blue-600">{testimonial.score}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! We offer a 7-day free trial with full access to all features. No credit card required to start."
              },
              {
                question: "Are the mock tests updated regularly?",
                answer: "Yes, our expert team regularly updates the question bank to reflect the latest exam patterns and syllabus changes."
              },
              {
                question: "Can I switch between plans?",
                answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              }
            ].map((faq, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white"
        >
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">30-Day Money Back Guarantee</h3>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Try our platform risk-free for 30 days. If you're not completely satisfied with your preparation 
            experience, we'll refund your subscription, no questions asked.
          </p>
        </motion.div>
      </div>
    </div>
  );
};