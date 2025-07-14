import { useState, useEffect } from 'react';
import { FirebaseService, FirebaseQuestion, TestSeries } from '../lib/firebase';

export const useFirebaseQuestions = (examType?: string, week?: string, subject?: string) => {
  const [questions, setQuestions] = useState<FirebaseQuestion[]>([]);
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examType || !week || !subject) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Decode subject name for Firebase path
        const decodedSubject = decodeURIComponent(subject);

        // Fetch test series info
        const testSeriesData = await FirebaseService.getTestSeries(examType, week, decodedSubject);
        setTestSeries(testSeriesData);

        // Set up real-time listener for questions
        const unsubscribe = FirebaseService.listenToQuestions(
          examType,
          week,
          decodedSubject,
          (questionsData) => {
            setQuestions(questionsData);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
        setLoading(false);
      }
    };

    const unsubscribe = fetchData();
    
    return () => {
      if (unsubscribe instanceof Promise) {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, [examType, week, subject]);

  return { questions, testSeries, loading, error };
};

export const useAllTestSeries = () => {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllTestSeries = async () => {
    try {
      setLoading(true);
      setError(null);

      const allTestSeries = await FirebaseService.getAllTestSeries();
      setTestSeries(allTestSeries);
    } catch (err) {
      console.error('Error fetching test series:', err);
      setError('Failed to load test series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTestSeries();
  }, []);

  return { testSeries, loading, error, refetch: fetchAllTestSeries };
};

export const useTestProgress = (userId: string, testId: string) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !testId) {
      setLoading(false);
      return;
    }

    const unsubscribe = FirebaseService.listenToTestProgress(
      userId,
      testId,
      (progressData) => {
        setProgress(progressData);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId, testId]);

  return { progress, loading };
};