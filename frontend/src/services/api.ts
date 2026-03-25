import axios from 'axios';
import { InterviewMode, Feedback } from '../types';


const API_BASE_URL = 'http://localhost:8000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Auth endpoints
export const registerUser = async (userData: any) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail === "User already exists") {
      // User already registered, not an error for our use case
      console.log('User already exists in MongoDB');
      return { message: "User already registered" };
    }
    throw error;
  }
};


export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/auth/profile/${userId}`);
  return response.data;
};


// Interview endpoints
export const startInterview = async (userId: string, mode: InterviewMode) => {
  const response = await api.post('/interview/start', null, {
    params: { user_id: userId, mode }
  });
  return response.data;
};


export const submitAnswer = async (sessionId: string, answer: string) => {
  const response = await api.post(`/interview/answer/${sessionId}`, null, {
    params: { answer_text: answer }
  });
  return response.data;
};


export const getInterviewHistory = async (userId: string) => {
  const response = await api.get(`/interview/history/${userId}`);
  return response.data;
};

export const getInterviewById = async (interviewId: string) => {
  const response = await api.get(`/interview/${interviewId}`);
  return response.data;
};
// Feedback endpoints
export const getFeedback = async (sessionId: string): Promise<Feedback> => {
  const response = await api.get(`/feedback/${sessionId}`);
  return response.data;
};


export default api;
