import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Button,
} from '@mui/material';
import { ArrowBack, SkipNext } from '@mui/icons-material';
import VoiceInterview from './VoiceInterview';
import TextInterview from './TextInterview';
import { InterviewMode, InterviewSession } from '../../types';
import { submitAnswer } from '../../services/api';
import toast from 'react-hot-toast';

const InterviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [mode, setMode] = useState<InterviewMode>(InterviewMode.TEXT_TO_TEXT);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [round, setRound] = useState('HR');
  const [questionIndex, setQuestionIndex] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasStartedAnswering, setHasStartedAnswering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questionReadComplete, setQuestionReadComplete] = useState(false);

  useEffect(() => {
    // Load session from localStorage
    const savedSession = localStorage.getItem('interviewSession');
    const savedMode = localStorage.getItem('interviewMode');

    if (savedSession && savedMode) {
      const sessionData = JSON.parse(savedSession);
      setSession(sessionData);
      setMode(savedMode as InterviewMode);
      setCurrentQuestion(sessionData.question);
      setRound(sessionData.round);
      setQuestionIndex(sessionData.question_index);

      // For TEXT_TO_TEXT and VOICE_TO_TEXT modes, question is immediately "read"
      if (savedMode === InterviewMode.TEXT_TO_TEXT || savedMode === InterviewMode.VOICE_TO_TEXT) {
        setQuestionReadComplete(true);
      }
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Auto-skip when timer reaches 0
  useEffect(() => {
    const handleAutoSkip = async () => {
      if (!session || isAnswering) return;

      console.log('AUTO-SKIP: Timer reached 0, skipping question...');
      toast('⏰ Time\'s up! Moving to next question', {
        duration: 2000,
      });

      setIsAnswering(true);

      try {
        const response = await submitAnswer(session.session_id, '');
        console.log('Auto-skip response:', response);

        if (response.status === 'completed') {
          toast.success('Interview completed!');
          navigate(`/feedback/${session.session_id}`);
        } else {
          setCurrentQuestion(response.next_question);
          setRound(response.round);
          setQuestionIndex(response.question_index);
          setTimeLeft(10);
          setIsAnswering(false);
          setHasStartedAnswering(false);
          setQuestionReadComplete(
            mode === InterviewMode.TEXT_TO_TEXT || mode === InterviewMode.VOICE_TO_TEXT
          );
        }
      } catch (error) {
        console.error('Error during auto-skip:', error);
        toast.error('Failed to skip question');
        setIsAnswering(false);
      }
    };

    // Check if we need to auto-skip
    if (timeLeft === 0 && !hasStartedAnswering && !isAnswering && session) {
      console.log('Triggering auto-skip...');
      handleAutoSkip();
    }
  }, [timeLeft, hasStartedAnswering, isAnswering, session, navigate, mode]);

  // Timer countdown - ONLY starts after question is read
  useEffect(() => {
    // Don't start timer if:
    // 1. User has started answering
    // 2. Currently submitting an answer
    // 3. Time is already up
    // 4. Question hasn't been read yet
    if (hasStartedAnswering || isAnswering || timeLeft <= 0 || !questionReadComplete) {
      return;
    }

    const timer = setTimeout(() => {
      console.log(`Timer: ${timeLeft} -> ${timeLeft - 1}`);
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, hasStartedAnswering, isAnswering, questionReadComplete]);

  // Calculate progress
  useEffect(() => {
    const totalQuestions = 30;
    const currentQuestionNumber =
      (round === 'HR' ? 0 : round === 'Technical' ? 10 : 20) + questionIndex;
    setProgress((currentQuestionNumber / totalQuestions) * 100);
  }, [round, questionIndex]);

  const handleUserStartedAnswering = () => {
    console.log('User started answering');
    setHasStartedAnswering(true);
  };

  const handleQuestionReadComplete = () => {
    console.log('Question read complete - timer will now start');
    setQuestionReadComplete(true);
  };

  const handleAnswer = async (answer: string) => {
    if (!session) return;

    setIsAnswering(true);

    try {
      const response = await submitAnswer(session.session_id, answer);

      if (response.status === 'completed') {
        toast.success('Interview completed!');
        navigate(`/feedback/${session.session_id}`);
      } else {
        setCurrentQuestion(response.next_question);
        setRound(response.round);
        setQuestionIndex(response.question_index);
        setTimeLeft(10);
        setIsAnswering(false);
        setHasStartedAnswering(false);
        setQuestionReadComplete(
          mode === InterviewMode.TEXT_TO_TEXT || mode === InterviewMode.VOICE_TO_TEXT
        );
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
      setIsAnswering(false);
    }
  };

  const handleManualSkip = async () => {
    if (!session || isAnswering) return;

    console.log('Manual skip');
    toast('Skipping question...');

    setIsAnswering(true);

    try {
      const response = await submitAnswer(session.session_id, '');

      if (response.status === 'completed') {
        toast.success('Interview completed!');
        navigate(`/feedback/${session.session_id}`);
      } else {
        setCurrentQuestion(response.next_question);
        setRound(response.round);
        setQuestionIndex(response.question_index);
        setTimeLeft(10);
        setIsAnswering(false);
        setHasStartedAnswering(false);
        setQuestionReadComplete(
          mode === InterviewMode.TEXT_TO_TEXT || mode === InterviewMode.VOICE_TO_TEXT
        );
      }
    } catch (error) {
      console.error('Error skipping question:', error);
      toast.error('Failed to skip question');
      setIsAnswering(false);
    }
  };

  const handleBackToDashboard = () => {
    if (window.confirm('Are you sure you want to exit the interview? Your progress will be saved.')) {
      navigate('/dashboard');
    }
  };

  const renderInterviewComponent = () => {
    if (mode === InterviewMode.TEXT_TO_TEXT) {
      return (
        <TextInterview
          key={`${round}-${questionIndex}`}
          question={currentQuestion}
          onAnswer={handleAnswer}
          isAnswering={isAnswering}
          onStartTyping={handleUserStartedAnswering}
        />
      );
    } else {
      return (
        <VoiceInterview
          key={`${round}-${questionIndex}`}
          question={currentQuestion}
          onAnswer={handleAnswer}
          isAnswering={isAnswering}
          mode={mode}
          onStartSpeaking={handleUserStartedAnswering}
          onQuestionReadComplete={handleQuestionReadComplete}
        />
      );
    }
  };

  // Add debug logging
  useEffect(() => {
    console.log('Current state:', {
      timeLeft,
      hasStartedAnswering,
      isAnswering,
      questionReadComplete,
      hasSession: !!session,
      round,
      questionIndex,
      mode
    });
  }, [timeLeft, hasStartedAnswering, isAnswering, questionReadComplete, session, round, questionIndex, mode]);

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading interview session...</Typography>
      </Container>
    );
  }

  const getRoundColor = (roundName: string) => {
    switch (roundName) {
      case 'HR':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'Technical':
        return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      case 'Management':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.4)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToDashboard}
            aria-label="back"
            sx={{
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            PrepTalk Interview
          </Typography>
          <Chip
            label={`${round} Round`}
            sx={{
              background: getRoundColor(round),
              color: 'white',
              fontWeight: 600,
              mr: 2,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
          <Chip
            label={`${questionIndex}/10`}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          />
        </Toolbar>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #10b981 0%, #14b8a6 100%)',
            },
          }}
        />
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: getRoundColor(round),
            },
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                {round} Round
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Question {questionIndex} of 10
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {hasStartedAnswering ? (
                <Chip
                  label="Timer Paused"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: 600,
                    animation: 'pulse 2s infinite',
                  }}
                />
              ) : !questionReadComplete ? (
                <Chip
                  label="Reading Question..."
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    fontWeight: 600,
                    animation: 'pulse 2s infinite',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background:
                      timeLeft <= 3
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow:
                      timeLeft <= 3
                        ? '0 0 20px rgba(239, 68, 68, 0.6)'
                        : '0 4px 14px rgba(99, 102, 241, 0.4)',
                    animation: timeLeft <= 3 ? 'pulse 1s infinite' : 'none',
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {timeLeft}
                  </Typography>
                </Box>
              )}

              <Button
                variant="outlined"
                startIcon={<SkipNext />}
                onClick={handleManualSkip}
                disabled={isAnswering}
                sx={{
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'rgba(148, 163, 184, 0.5)',
                    bgcolor: 'rgba(148, 163, 184, 0.1)',
                  },
                }}
              >
                Skip
              </Button>
            </Box>
          </Box>

          {timeLeft <= 3 && timeLeft > 0 && !hasStartedAnswering && questionReadComplete && (
            <Box sx={{ mb: 3 }}>
              <Chip
                label="⚠️ Hurry up! Time is running out!"
                sx={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: 600,
                  animation: 'pulse 1s infinite',
                }}
              />
            </Box>
          )}

          {renderInterviewComponent()}
        </Paper>
      </Container>
    </>
  );
};

export default InterviewScreen;