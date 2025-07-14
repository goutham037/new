import { supabase } from './supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  planType: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createRazorpayOrder = async (options: PaymentOptions) => {
  try {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const initiatePayment = async (options: PaymentOptions): Promise<RazorpayResponse> => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  const order = await createRazorpayOrder(options);

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'TGECET & APECET Prep',
      description: `Subscription for ${options.planType}`,
      order_id: order.id,
      prefill: {
        name: options.userName,
        email: options.userEmail,
        contact: options.userPhone || '',
      },
      theme: {
        color: '#3B82F6',
      },
      handler: (response: RazorpayResponse) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  });
};

export const verifyPayment = async (paymentData: RazorpayResponse & { userId: string; planType: string }) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const getSubscriptionPlans = () => {
  return [
    {
      id: 'TGECET_Monthly',
      name: 'TGECET Complete',
      price: 99,
      duration: 'month',
      features: [
        'All TGECET subjects (Math, Physics, Chemistry)',
        'Weekly mock tests',
        'Detailed analytics & performance reports',
        'Real-time leaderboard',
        'Downloadable PDF reports',
        'Expert explanations',
        'Mobile app access'
      ]
    },
    {
      id: 'APECET_Monthly',
      name: 'APECET Complete',
      price: 99,
      duration: 'month',
      features: [
        'All APECET subjects (Math, Physics, Chemistry)',
        'Weekly mock tests',
        'Detailed analytics & performance reports',
        'Real-time leaderboard',
        'Downloadable PDF reports',
        'Expert explanations',
        'Mobile app access'
      ]
    },
    {
      id: 'Both_Monthly',
      name: 'Both Exams',
      price: 149,
      duration: 'month',
      features: [
        'All subjects for both TGECET & APECET',
        'Weekly mock tests for both exams',
        'Advanced analytics & insights',
        'Priority support',
        'Exclusive study materials',
        'Performance comparison tools',
        'Early access to new features'
      ]
    },
    {
      id: 'TGECET_Yearly',
      name: 'TGECET Complete (Yearly)',
      price: 999,
      duration: 'year',
      originalPrice: 1188,
      features: [
        'All TGECET subjects (Math, Physics, Chemistry)',
        'Weekly mock tests',
        'Detailed analytics & performance reports',
        'Real-time leaderboard',
        'Downloadable PDF reports',
        'Expert explanations',
        'Mobile app access',
        '2 months free'
      ]
    },
    {
      id: 'APECET_Yearly',
      name: 'APECET Complete (Yearly)',
      price: 999,
      duration: 'year',
      originalPrice: 1188,
      features: [
        'All APECET subjects (Math, Physics, Chemistry)',
        'Weekly mock tests',
        'Detailed analytics & performance reports',
        'Real-time leaderboard',
        'Downloadable PDF reports',
        'Expert explanations',
        'Mobile app access',
        '2 months free'
      ]
    },
    {
      id: 'Both_Yearly',
      name: 'Both Exams (Yearly)',
      price: 1499,
      duration: 'year',
      originalPrice: 1788,
      features: [
        'All subjects for both TGECET & APECET',
        'Weekly mock tests for both exams',
        'Advanced analytics & insights',
        'Priority support',
        'Exclusive study materials',
        'Performance comparison tools',
        'Early access to new features',
        '2 months free'
      ]
    }
  ];
};