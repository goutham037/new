// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, set, push, update, remove, onValue, off } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDutAfEm-91LvSiA6g3sYBJuD5GJusuhsQ",
  authDomain: "quizmaker-3ee53.firebaseapp.com",
  databaseURL: "https://quizmaker-3ee53-default-rtdb.firebaseio.com",
  projectId: "quizmaker-3ee53",
  storageBucket: "quizmaker-3ee53.firebasestorage.app",
  messagingSenderId: "581410078911",
  appId: "1:581410078911:web:a569b4902a2d10c687460a",
  measurementId: "G-8D4BP9P98C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const database = getDatabase(app);
export const auth = getAuth(app);
export const firebaseAuth = getAuth(app);


// User interface
export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscription: {
    plan: string;
    status: 'active' | 'inactive' | 'trial';
    expiresAt: number;
  };
  stats: {
    testsCompleted: number;
    averageScore: number;
    totalTime: number;
    currentRank: number;
    streak: number;
  };
}

// Question interface matching your Firebase structure
export interface FirebaseQuestion {
  number: number;
  question: string;
  choices: {
    0: string;
    1: string;
    2: string;
    3: string;
  };
  correct_answer: number;
  explanation: string;
}

export interface TestSeries {
  id: string;
  title: string;
  subject: string;
  exam_type: 'TGECET' | 'APECET' | 'Target48';
  week: string;
  duration_minutes: number;
  total_questions: number;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  questions: Record<string, FirebaseQuestion>;
}

export interface TestProgress {
  testId: string;
  userId: string;
  answers: Record<number, number>;
  markedForReview: number[];
  currentQuestion: number;
  timeRemaining: number;
  startedAt: number;
  lastUpdated: number;
  isCompleted: boolean;
}

export interface TestResult {
  testId: string;
  userId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  answers: Record<number, number>;
  completedAt: number;
  rank?: number;
  percentile?: number;
}

// Firebase Database Service
export class FirebaseService {
  // Authentication
  static async signIn(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile
    await this.createUserProfile(result.user.uid, {
      email,
      displayName,
      subscription: {
        plan: 'trial',
        status: 'trial',
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days trial
      },
      stats: {
        testsCompleted: 0,
        averageScore: 0,
        totalTime: 0,
        currentRank: 0,
        streak: 0
      }
    });

    return result.user;
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // User Management
  static async createUserProfile(uid: string, userData: Partial<FirebaseUser>): Promise<void> {
    const userRef = ref(database, `users/${uid}`);
    await set(userRef, {
      uid,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      ...userData
    });
  }

  static async getUserProfile(uid: string): Promise<FirebaseUser | null> {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<FirebaseUser>): Promise<void> {
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, {
      ...updates,
      lastUpdated: Date.now()
    });
  }

  // Get all subjects and their test series
  static async getSubjects(): Promise<Record<string, any>> {
    try {
      const subjectsRef = ref(database, 'subjects');
      const snapshot = await get(subjectsRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  // Get all available test series
  static async getAllTestSeries(): Promise<TestSeries[]> {
    try {
      const subjects = await this.getSubjects();
      const testSeries: TestSeries[] = [];

      for (const examType in subjects) {
        for (const week in subjects[examType]) {
          for (const subject in subjects[examType][week]) {
            if (subject !== 'metadata') {
              const questions = subjects[examType][week][subject];
              const questionCount = Object.keys(questions).filter(key => 
                key !== 'metadata' && questions[key].number
              ).length;
              
              if (questionCount > 0) {
                testSeries.push({
                  id: `${examType}_${week}_${encodeURIComponent(subject)}`,
                  title: `${subject} - ${week}`,
                  subject: subject,
                  exam_type: examType as 'TGECET' | 'APECET' | 'Target48',
                  week: week,
                  duration_minutes: this.calculateDuration(questionCount),
                  total_questions: questionCount,
                  difficulty_level: 'Medium',
                  questions: questions
                });
              }
            }
          }
        }
      }

      return testSeries;
    } catch (error) {
      console.error('Error fetching all test series:', error);
      throw error;
    }
  }

  // Get specific test series
  static async getTestSeries(examType: string, week: string, subject: string): Promise<TestSeries | null> {
    try {
      const testRef = ref(database, `subjects/${examType}/${week}/${subject}`);
      const snapshot = await get(testRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const questionCount = Object.keys(data).filter(key => 
          key !== 'metadata' && data[key].number
        ).length;
        
        return {
          id: `${examType}_${week}_${encodeURIComponent(subject)}`,
          title: `${subject} - ${week}`,
          subject: subject,
          exam_type: examType as 'TGECET' | 'APECET' | 'Target48',
          week: week,
          duration_minutes: this.calculateDuration(questionCount),
          total_questions: questionCount,
          difficulty_level: 'Medium',
          questions: data
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching test series:', error);
      throw error;
    }
  }

  // Get questions for a specific test (real-time)
  static async getQuestions(examType: string, week: string, subject: string): Promise<FirebaseQuestion[]> {
    try {
      const questionsRef = ref(database, `subjects/${examType}/${week}/${subject}`);
      const snapshot = await get(questionsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const questions: FirebaseQuestion[] = [];
        
        // Convert Firebase object to array, excluding metadata
        Object.keys(data).forEach(key => {
          if (key !== 'metadata' && data[key].number) {
            questions.push(data[key]);
          }
        });
        
        // Sort by question number
        return questions.sort((a, b) => a.number - b.number);
      }
      return [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  // Real-time question fetching with listener
  static listenToQuestions(
    examType: string, 
    week: string, 
    subject: string, 
    callback: (questions: FirebaseQuestion[]) => void
  ): () => void {
    const questionsRef = ref(database, `subjects/${examType}/${week}/${subject}`);
    
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const questions: FirebaseQuestion[] = [];
        
        Object.keys(data).forEach(key => {
          if (key !== 'metadata' && data[key].number) {
            questions.push(data[key]);
          }
        });
        
        questions.sort((a, b) => a.number - b.number);
        callback(questions);
      } else {
        callback([]);
      }
    });

    return () => off(questionsRef, 'value', unsubscribe);
  }
// Test Progress Management
static async saveTestProgress(userId: string, testId: string, progress: TestProgress): Promise<void> {
  try {
    if (!userId) throw new Error("userId is undefined");

    const progressRef = ref(database, `users2/${userId}/progress/${testId}`);
    await set(progressRef, {
      ...progress,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error saving test progress:', error);
    throw error;
  }
}

static async getTestProgress(userId: string, testId: string): Promise<TestProgress | null> {
  try {
    if (!userId) throw new Error("userId is undefined");

    const progressRef = ref(database, `users2/${userId}/progress/${testId}`);
    const snapshot = await get(progressRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching test progress:', error);
    return null;
  }
}

// Test Results Management
static async saveTestResult(userId: string, testId: string, result: TestResult): Promise<void> {
  try {
    if (!userId) throw new Error("userId is undefined");

    const resultRef = ref(database, `users2/${userId}/results/${testId}`);
    const resultId = push(resultRef).key;

    await set(ref(database, `users2/${userId}/results/${testId}/${resultId}`), {
      ...result,
      id: resultId,
      completedAt: Date.now()
    });

    // Update user stats
    await this.updateUserStats(userId, result);

    // Update leaderboard
    await this.updateLeaderboard(testId, {
      userId,
      score: result.score,
      timeTaken: result.timeTaken,
      completedAt: Date.now()
    });
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
}

static async getTestResults(userId: string, testId: string): Promise<TestResult[]> {
  try {
    if (!userId) throw new Error("userId is undefined");

    const resultsRef = ref(database, `users2/${userId}/results/${testId}`);
    const snapshot = await get(resultsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data).sort((a: any, b: any) => b.completedAt - a.completedAt);
    }
    return [];
  } catch (error) {
    console.error('Error fetching test results:', error);
    return [];
  }
}

  // Leaderboard Management
  static async updateLeaderboard(testId: string, entry: any): Promise<void> {
    try {
      const leaderboardRef = ref(database, `leaderboards/${testId}`);
      await push(leaderboardRef, {
        ...entry,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  static async getLeaderboard(testId: string, limit: number = 50): Promise<any[]> {
    try {
      const leaderboardRef = ref(database, `leaderboards/${testId}`);
      const snapshot = await get(leaderboardRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const entries = Object.values(data);
        
        // Sort by score (descending) and time (ascending)
        return entries
          .sort((a: any, b: any) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeTaken - b.timeTaken;
          })
          .slice(0, limit);
      }
      return [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // User Statistics
  private static async updateUserStats(userId: string, result: TestResult): Promise<void> {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const currentStats = userData.stats || {};
        
        const newStats = {
          testsCompleted: (currentStats.testsCompleted || 0) + 1,
          averageScore: Math.round(
            ((currentStats.averageScore || 0) * (currentStats.testsCompleted || 0) + result.score) /
            ((currentStats.testsCompleted || 0) + 1)
          ),
          totalTime: (currentStats.totalTime || 0) + result.timeTaken,
          currentRank: currentStats.currentRank || 0,
          streak: this.calculateStreak(userData.results || {})
        };

        await update(userRef, { stats: newStats });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  private static calculateStreak(results: Record<string, any>): number {
    // Calculate consecutive days of test completion
    const dates = Object.values(results)
      .flat()
      .map((result: any) => new Date(result.completedAt).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();

    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const date = new Date(dates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - streak);
      
      if (date.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Calculate duration based on question count
  private static calculateDuration(questionCount: number): number {
    // 1.5 minutes per question as a base, minimum 30 minutes
    return Math.max(30, Math.ceil(questionCount * 1.5));
  }

  // Real-time listeners
  static listenToUserProfile(uid: string, callback: (user: FirebaseUser | null) => void): () => void {
    const userRef = ref(database, `users/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
    return () => off(userRef, 'value', unsubscribe);
  }

  static listenToTestProgress(
    userId: string, 
    testId: string, 
    callback: (progress: TestProgress | null) => void
  ): () => void {
    const progressRef = ref(database, `users/${userId}/progress/${testId}`);
    const unsubscribe = onValue(progressRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
    return () => off(progressRef, 'value', unsubscribe);
  }
}

export default app;