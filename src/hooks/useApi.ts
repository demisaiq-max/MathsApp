import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { AnswerSheet, Student, BoardPost, ExamStats } from '../types';

export const useAnswerSheets = () => {
  const [answerSheets, setAnswerSheets] = useState<AnswerSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswerSheets = async () => {
    try {
      setLoading(true);
      const sheets = await apiService.getAnswerSheets();
      setAnswerSheets(sheets);
      setError(null);
    } catch (err) {
      setError('Failed to fetch answer sheets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswerSheets();
  }, []);

  const createAnswerSheet = async (sheet: Omit<AnswerSheet, 'id'>) => {
    try {
      const newSheet = await apiService.createAnswerSheet(sheet);
      setAnswerSheets(prev => [...prev, newSheet]);
      return newSheet;
    } catch (err) {
      setError('Failed to create answer sheet');
      throw err;
    }
  };

  const deleteAnswerSheet = async (id: string) => {
    try {
      await apiService.deleteAnswerSheet(id);
      setAnswerSheets(prev => prev.filter(sheet => sheet.id !== id));
    } catch (err) {
      setError('Failed to delete answer sheet');
      throw err;
    }
  };

  return {
    answerSheets,
    loading,
    error,
    createAnswerSheet,
    deleteAnswerSheet,
    refetch: fetchAnswerSheets
  };
};

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentData = await apiService.getStudents();
      setStudents(studentData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const createStudent = async (student: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      const newStudent = await apiService.createStudent(student);
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      setError('Failed to create student');
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await apiService.deleteStudent(id);
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (err) {
      setError('Failed to delete student');
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    createStudent,
    deleteStudent,
    refetch: fetchStudents
  };
};

export const useBoardPosts = () => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postData = await apiService.getBoardPosts();
      setPosts(postData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch board posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: string) => {
    try {
      await apiService.deleteBoardPost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError('Failed to delete post');
      throw err;
    }
  };

  return {
    posts,
    loading,
    error,
    deletePost,
    refetch: fetchPosts
  };
};

export const useExamStats = () => {
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await apiService.getExamStats();
        setStats(statsData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};