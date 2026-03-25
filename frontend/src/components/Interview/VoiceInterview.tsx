import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Replay,
  PlayArrow,
} from '@mui/icons-material';
import InterviewAvatar from './InterviewAvatar';
import { InterviewMode } from '../../types';
import toast from 'react-hot-toast';

interface VoiceInterviewProps {
  question: string;
  onAnswer: (answer: string) => void;
  isAnswering: boolean;
  mode: InterviewMode;
  onStartSpeaking: () => void;
  onQuestionReadComplete?: () => void;
}

const VoiceInterview: React.FC<VoiceInterviewProps> = ({
  question,
  onAnswer,
  isAnswering,
  mode,
  onStartSpeaking,
  onQuestionReadComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState('');
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [hasNotifiedReadComplete, setHasNotifiedReadComplete] = useState(false);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const finalTranscriptRef = useRef('');

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log(`Loaded ${voices.length} voices`);
      }
    };

    loadVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.getVoices();
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript || interimTranscript) {
          finalTranscriptRef.current += finalTranscript;
          setTranscript((prev) => prev + finalTranscript);

          if (!hasStartedSpeaking) {
            setHasStartedSpeaking(true);
            onStartSpeaking();
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition error. Please try again.');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);

        const currentAnswer = finalTranscriptRef.current.trim();
        if (currentAnswer) {
          onAnswer(currentAnswer);
          finalTranscriptRef.current = '';
          setTranscript('');
          setHasStartedSpeaking(false);
          toast.success('Answer submitted');
        } else {
          toast.error('No speech detected. Please try again.');
          setHasStartedSpeaking(false);
        }
      };
    } else {
      setError('Speech recognition is not supported in your browser.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [hasStartedSpeaking, onStartSpeaking, onAnswer]);

  // Reset state when question changes
  useEffect(() => {
    setHasStartedSpeaking(false);
    setTranscript('');
    setShowPlayButton(false);
    setHasNotifiedReadComplete(false);
    finalTranscriptRef.current = '';

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [question]);

  // For VOICE_TO_TEXT mode, notify immediately that question is "read"
  useEffect(() => {
    if (mode === InterviewMode.VOICE_TO_TEXT && onQuestionReadComplete && !hasNotifiedReadComplete) {
      console.log('VOICE_TO_TEXT mode - starting timer immediately');
      onQuestionReadComplete();
      setHasNotifiedReadComplete(true);
    }
  }, [mode, onQuestionReadComplete, hasNotifiedReadComplete]);

  // Auto-play question in voice-to-voice mode
  useEffect(() => {
    if (
      mode === InterviewMode.VOICE_TO_VOICE &&
      audioEnabled &&
      question &&
      voicesLoaded &&
      !showPlayButton &&
      !hasNotifiedReadComplete
    ) {
      const timer = setTimeout(() => {
        attemptToSpeak();
      }, 1000);

      return () => clearTimeout(timer);
    } else if (mode === InterviewMode.VOICE_TO_VOICE && !audioEnabled && !hasNotifiedReadComplete) {
      // If audio is disabled, notify immediately to start timer
      console.log('Audio disabled, starting timer immediately');
      if (onQuestionReadComplete) {
        onQuestionReadComplete();
        setHasNotifiedReadComplete(true);
      }
    }
  }, [mode, audioEnabled, question, voicesLoaded, showPlayButton, hasNotifiedReadComplete, onQuestionReadComplete]);

  const attemptToSpeak = () => {
    try {
      const testUtterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(testUtterance);
      window.speechSynthesis.cancel();
      speakQuestion(false);
    } catch (error) {
      console.log('Auto-speak not available, showing play button');
      setShowPlayButton(true);
    }
  };

  const speakQuestion = (isUserTriggered: boolean = false) => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in your browser');
      // Notify to start timer even if TTS fails
      if (onQuestionReadComplete && !hasNotifiedReadComplete) {
        onQuestionReadComplete();
        setHasNotifiedReadComplete(true);
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(question);
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        const preferredVoice =
          englishVoices.find(
            voice =>
              voice.name.includes('Google') ||
              voice.name.includes('Microsoft') ||
              voice.name.includes('Samantha') ||
              voice.name.includes('Daniel')
          ) || englishVoices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('Using voice:', preferredVoice.name);
        }

        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setShowPlayButton(false);
          console.log('Started speaking');
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          console.log('Finished speaking');
          // Notify parent that question reading is complete, timer can start
          if (onQuestionReadComplete && !hasNotifiedReadComplete) {
            console.log('Question read complete, notifying parent to start timer');
            onQuestionReadComplete();
            setHasNotifiedReadComplete(true);
          }
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          setIsSpeaking(false);
          console.error('Speech error:', event.error, event);

          if (!isUserTriggered) {
            setShowPlayButton(true);
          } else {
            toast.error('Unable to read question aloud. Please read the text below.');
          }

          // Even on error, notify to start timer
          if (onQuestionReadComplete && !hasNotifiedReadComplete) {
            console.log('Speech error, starting timer anyway');
            onQuestionReadComplete();
            setHasNotifiedReadComplete(true);
          }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.error('Error in speakQuestion:', error);
      setIsSpeaking(false);

      if (!isUserTriggered) {
        setShowPlayButton(true);
      } else {
        toast.error('Unable to read question aloud. Please read the text below.');
      }

      // On catch error, notify to start timer
      if (onQuestionReadComplete && !hasNotifiedReadComplete) {
        console.log('Catch error in speakQuestion, starting timer');
        onQuestionReadComplete();
        setHasNotifiedReadComplete(true);
      }
    }
  };

  const handlePlayQuestion = () => {
    console.log('User triggered play');

    if (!window.speechSynthesis) {
      toast.error('Speech synthesis not available');
      // Notify to start timer even if synthesis not available
      if (onQuestionReadComplete && !hasNotifiedReadComplete) {
        onQuestionReadComplete();
        setHasNotifiedReadComplete(true);
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setShowPlayButton(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Notify when manual play completes
        if (onQuestionReadComplete && !hasNotifiedReadComplete) {
          console.log('Manual play complete, starting timer');
          onQuestionReadComplete();
          setHasNotifiedReadComplete(true);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error('Unable to play audio. Please read the question below.');
        // Even on error, start timer
        if (onQuestionReadComplete && !hasNotifiedReadComplete) {
          onQuestionReadComplete();
          setHasNotifiedReadComplete(true);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Play error:', error);
      toast.error('Unable to play audio. Please read the question below.');
      // On error, start timer
      if (onQuestionReadComplete && !hasNotifiedReadComplete) {
        onQuestionReadComplete();
        setHasNotifiedReadComplete(true);
      }
    }
  };

  const repeatQuestion = () => {
    handlePlayQuestion();
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);

    if (audioEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast('Audio disabled', { duration: 1000 });

      // If audio is toggled off and timer hasn't started, start it
      if (onQuestionReadComplete && !hasNotifiedReadComplete) {
        console.log('Audio disabled, starting timer');
        onQuestionReadComplete();
        setHasNotifiedReadComplete(true);
      }
    } else {
      toast('Audio enabled', { duration: 1000 });
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript('');
      setError('');
      finalTranscriptRef.current = '';

      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success('Recording started - Timer paused');

        if (!hasStartedSpeaking) {
          setHasStartedSpeaking(true);
          onStartSpeaking();
        }
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (utteranceRef.current) {
        utteranceRef.current = null;
      }
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Avatar Section */}
      {mode === InterviewMode.VOICE_TO_VOICE && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <InterviewAvatar isSpeaking={isSpeaking} />
        </Box>
      )}

      {/* Play Button Alert */}
      {mode === InterviewMode.VOICE_TO_VOICE && showPlayButton && (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<PlayArrow />}
              onClick={handlePlayQuestion}
              sx={{
                fontWeight: 600,
              }}
            >
              Play Question
            </Button>
          }
          sx={{
            background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            '& .MuiAlert-icon': {
              color: '#3b82f6',
            },
          }}
        >
          Click "Play Question" to hear the question aloud (timer will start after)
        </Alert>
      )}

      {/* Question Display */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            mb: 2,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: '#818cf8',
              fontWeight: 600,
              letterSpacing: 1.2,
            }}
          >
            Question
          </Typography>

          {mode === InterviewMode.VOICE_TO_VOICE && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={repeatQuestion}
                size="small"
                title="Play/Repeat question"
                disabled={isSpeaking}
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.2)',
                  },
                }}
              >
                <Replay sx={{ color: '#6366f1' }} />
              </IconButton>
              <IconButton
                onClick={toggleAudio}
                size="small"
                title={audioEnabled ? "Mute audio" : "Unmute audio"}
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.2)',
                  },
                }}
              >
                {audioEnabled ? (
                  <VolumeUp sx={{ color: '#6366f1' }} />
                ) : (
                  <VolumeOff sx={{ color: '#94a3b8' }} />
                )}
              </IconButton>
            </Box>
          )}
        </Box>

        <Typography variant="h6" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
          {question}
        </Typography>

        {mode === InterviewMode.VOICE_TO_VOICE && isSpeaking && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label="🔊 Reading question aloud... Timer will start after"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                fontWeight: 600,
                animation: 'pulse 1.5s infinite',
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Status Indicator */}
      {isRecording && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            label="🎤 Recording... Timer paused"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              animation: 'pulse 1.5s infinite',
            }}
          />
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{
            background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            '& .MuiAlert-icon': {
              color: '#ef4444',
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Transcript Display */}
      {mode === InterviewMode.VOICE_TO_TEXT && transcript && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: '#10b981',
              fontWeight: 600,
              letterSpacing: 1.2,
            }}
          >
            Your Answer
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.8 }}>
            {transcript}
          </Typography>
        </Paper>
      )}

      {/* Recording Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        {!isAnswering ? (
          <>
            {!isRecording ? (
              <IconButton
                onClick={startRecording}
                disabled={isSpeaking}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: 'white',
                  width: 90,
                  height: 90,
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 32px rgba(99, 102, 241, 0.6)',
                  },
                  '&:disabled': {
                    background: 'rgba(148, 163, 184, 0.2)',
                    color: 'rgba(148, 163, 184, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Mic sx={{ fontSize: 45 }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={stopRecording}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  width: 90,
                  height: 90,
                  animation: 'pulse 1.5s infinite',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: '0 12px 32px rgba(239, 68, 68, 0.6)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <MicOff sx={{ fontSize: 45 }} />
              </IconButton>
            )}
          </>
        ) : (
          <CircularProgress size={70} sx={{ color: '#6366f1' }} />
        )}
      </Box>

      {/* Instructions */}
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ fontWeight: 500 }}
      >
        {isSpeaking
          ? '🔊 Please wait while the question is being read...'
          : isRecording
          ? '🛑 Click the microphone to stop recording and submit'
          : '🎤 Click the microphone to start recording (timer will pause)'}
      </Typography>

      {/* Recording Status */}
      {isRecording && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '50%',
              animation: 'pulse 1s infinite',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: '#ef4444',
              fontWeight: 600,
            }}
          >
            Recording in progress... Speak clearly
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VoiceInterview;