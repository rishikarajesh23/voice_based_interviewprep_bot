import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Home,
  TrendingUp,
  Psychology,
  RecordVoiceOver,
  Description,
  EmojiEvents,
  Warning,
  Assignment,
  AssignmentTurnedIn,
  AssignmentLate,
} from '@mui/icons-material';
import { getFeedback } from '../../services/api';
import { Feedback } from '../../types';
import toast from 'react-hot-toast';


// Extended Feedback interface to include new fields
interface ExtendedFeedback extends Feedback {
  completion_rate?: string;
  questions_attempted?: number;
  questions_skipped?: number;
}


const FeedbackScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<ExtendedFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    if (sessionId) {
      loadFeedback();
    }
  }, [sessionId]);


  const loadFeedback = async () => {
    try {
      setLoading(true);
      const feedbackData = await getFeedback(sessionId!);
      setFeedback(feedbackData as ExtendedFeedback);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setError('Failed to load feedback. Please try again.');
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'warning';
    return 'error';
  };


  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle color="success" />;
    if (score >= 3) return <Warning color="warning" />;
    return <Cancel color="error" />;
  };


  const getOverallMessage = (score: number) => {
    if (score === 0) return 'Please attempt the questions to receive a proper evaluation.';
    if (score === 1) return 'Significant improvement needed. Practice more to build confidence.';
    if (score === 2) return 'Below average performance. Focus on preparation and practice.';
    if (score === 3) return 'Average performance. There\'s room for improvement.';
    if (score === 4) return 'Good performance! Keep practicing to achieve excellence.';
    if (score === 5) return 'Excellent performance! You\'re well-prepared for interviews.';
    return '';
  };


  const renderScoreCard = (title: string, score: number, feedback: string, icon: React.ReactNode) => (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={`${score}/5`}
            color={getScoreColor(score) as any}
            size="small"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={(score / 5) * 100}
          color={getScoreColor(score) as any}
          sx={{ mb: 2, height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary">
          {feedback}
        </Typography>
      </CardContent>
    </Card>
  );


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }


  if (error || !feedback) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadFeedback}>
            Retry
          </Button>
        }>
          {error || 'No feedback available'}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }


  // Calculate completion percentage for display
  const completionPercentage = feedback.questions_attempted
    ? Math.round((feedback.questions_attempted / 30) * 100)
    : 0;


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <EmojiEvents sx={{
          fontSize: 60,
          color: feedback.overall_score === 0 ? 'grey.400' : 'primary.main',
          mb: 2
        }} />
        <Typography variant="h4" gutterBottom>
          Interview Completed!
        </Typography>
        <Typography variant="h5" color={feedback.overall_score === 0 ? 'error' : 'primary'} gutterBottom>
          Overall Score: {feedback.overall_score}/5
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {getOverallMessage(feedback.overall_score)}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Box
              key={star}
              sx={{
                fontSize: 30,
                color: star <= feedback.overall_score ? 'warning.main' : 'grey.300',
              }}
            >
              ★
            </Box>
          ))}
        </Box>
      </Paper>


      {/* Completion Statistics */}
      {(feedback.completion_rate || feedback.questions_attempted !== undefined) && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            Interview Completion Statistics
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  mb: 1
                }}>
                  <AssignmentTurnedIn sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" color="success.main">
                  {feedback.questions_attempted || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Questions Answered
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'error.light',
                  mb: 1
                }}>
                  <AssignmentLate sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
                <Typography variant="h4" color="error.main">
                  {feedback.questions_skipped || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Questions Skipped
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={completionPercentage}
                    size={80}
                    thickness={4}
                    sx={{
                      color: completionPercentage >= 80 ? 'success.main' :
                             completionPercentage >= 50 ? 'warning.main' : 'error.main'
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {`${completionPercentage}%`}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {feedback.completion_rate || '0/30'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
         
          {/* Completion Warning Message */}
          {completionPercentage < 50 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              You completed less than 50% of the interview questions. For a comprehensive evaluation,
              try to answer as many questions as possible in your next interview.
            </Alert>
          )}
          {completionPercentage === 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              No questions were answered during this interview. Please attempt to answer questions
              to receive meaningful feedback and improve your interview skills.
            </Alert>
          )}
        </Paper>
      )}


      {/* Performance Metrics */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Performance Breakdown
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          {renderScoreCard(
            'Clarity',
            feedback.clarity.score,
            feedback.clarity.feedback,
            <Description color="primary" />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderScoreCard(
            'Confidence',
            feedback.confidence.score,
            feedback.confidence.feedback,
            <Psychology color="primary" />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderScoreCard(
            'Relevance',
            feedback.relevance.score,
            feedback.relevance.feedback,
            <TrendingUp color="primary" />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderScoreCard(
            'Technical Knowledge',
            feedback.technical_knowledge.score,
            feedback.technical_knowledge.feedback,
            <Psychology color="primary" />
          )}
        </Grid>
        <Grid item xs={12}>
          {renderScoreCard(
            'Communication Skills',
            feedback.communication_skills.score,
            feedback.communication_skills.feedback,
            <RecordVoiceOver color="primary" />
          )}
        </Grid>
      </Grid>


      {/* Strengths and Improvements */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="success.main">
              Strengths
            </Typography>
            {feedback.strengths && feedback.strengths.length > 0 ? (
              <List>
                {feedback.strengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Complete more questions to identify your strengths.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="warning.main">
              Areas for Improvement
            </Typography>
            <List>
              {feedback.areas_for_improvement.map((area, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={area} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>


      {/* Overall Feedback */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Overall Feedback
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
          {feedback.overall_feedback}
        </Typography>
      </Paper>


      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => {
            localStorage.removeItem('interviewSession');
            localStorage.removeItem('interviewMode');
            navigate('/dashboard');
            toast.success('Ready for a new interview!');
          }}
        >
          Start New Interview
        </Button>
      </Box>
    </Container>
  );
};


export default FeedbackScreen;
