import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import toast from 'react-hot-toast';


interface TextInterviewProps {
  question: string;
  onAnswer: (answer: string) => void;
  isAnswering: boolean;
  onStartTyping: () => void;
}


const TextInterview: React.FC<TextInterviewProps> = ({
  question,
  onAnswer,
  isAnswering,
  onStartTyping,
}) => {
  const [answer, setAnswer] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 1000;


  useEffect(() => {
    // Reset typing state when question changes
    setHasStartedTyping(false);
    setAnswer('');
   
    // Focus on text field when component mounts or question changes
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [question]);


  useEffect(() => {
    setCharCount(answer.length);
  }, [answer]);


  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAnswer(newValue);
   
    // Notify parent that user has started typing
    if (newValue.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true);
      onStartTyping();
    }
  };


  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }


    if (!answer.trim()) {
      toast.error('Please provide an answer before submitting');
      return;
    }


    if (answer.length < 10) {
      toast.error('Please provide a more detailed answer');
      return;
    }


    onAnswer(answer.trim());
    setAnswer('');
    setHasStartedTyping(false);
    toast.success('Answer submitted');
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Question Display */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: '#212122' }}>
        <Typography variant="h6" component="div" gutterBottom>
          Question:
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          {question}
        </Typography>
      </Paper>


      {/* Status Indicator */}
      {hasStartedTyping && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            label="Timer paused - Take your time to answer"
            color="info"
            size="small"
            variant="outlined"
          />
        </Box>
      )}


      {/* Answer Input */}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          inputRef={textFieldRef}
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          placeholder="Start typing your answer... (Timer will pause once you start)"
          value={answer}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={isAnswering}
          inputProps={{
            maxLength: maxChars,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            },
          }}
        />


        {/* Character Count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Press Ctrl+Enter to submit
          </Typography>
          <Typography
            variant="caption"
            color={charCount > maxChars * 0.9 ? 'error' : 'text.secondary'}
          >
            {charCount}/{maxChars} characters
          </Typography>
        </Box>


        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            endIcon={isAnswering ? <CircularProgress size={20} color="inherit" /> : <Send />}
            disabled={isAnswering || !answer.trim()}
            sx={{ minWidth: 200 }}
          >
            {isAnswering ? 'Submitting...' : 'Submit Answer'}
          </Button>
        </Box>
      </Box>


     
    </Box>
  );
};


export default TextInterview;
