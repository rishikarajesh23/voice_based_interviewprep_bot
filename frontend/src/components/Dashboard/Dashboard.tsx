import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  History as HistoryIcon,
  PlayArrow,
  ExitToApp,
} from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { auth, logOut } from '../../services/firebase';
import { getUserProfile, startInterview, registerUser, getInterviewById } from '../../services/api';
import { InterviewMode } from '../../types';
import History from './History';
import Profile from './Profile';
import toast from 'react-hot-toast';

// ChartJS imports and registration are removed

const Dashboard: React.FC = () => {
  const [openModeDialog, setOpenModeDialog] = useState(false);
  const [selectedMode, setSelectedMode] = useState<InterviewMode>(InterviewMode.TEXT_TO_TEXT);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  console.log('Full User Profile:', userProfile);
  console.log('Interview History:', userProfile?.interview_history);

  const loadUserProfile = async () => {
    if (!auth.currentUser) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const profile = await getUserProfile(auth.currentUser.uid);

      // Fetch full interview data for each interview ID
      if (profile?.interview_history && profile.interview_history.length > 0) {
        const interviewsWithDetails = await Promise.all(
          profile.interview_history.map(async (interviewId: string) => {
            try {
              // Replace getInterviewById with your actual API function
              const interviewDetails = await getInterviewById(interviewId);
              return interviewDetails;
            } catch (error) {
              console.error(`Failed to fetch interview ${interviewId}:`, error);
              return null;
            }
          })
        );

        // Filter out any failed fetches and add to profile
        profile.interviews_with_details = interviewsWithDetails.filter(i => i !== null);
      }

      setUserProfile(profile);
    } catch (error: any) {
      if (error.response?.status === 404 && auth.currentUser) {
        try {
          const userData = {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email || '',
            name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            interview_history: [],
          };
          await registerUser(userData);
          const newProfile = await getUserProfile(auth.currentUser.uid);
          setUserProfile(newProfile);
          toast.success('Profile created successfully');
        } catch {
          setUserProfile({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            interview_history: [],
            total_interviews: 0,
          });
        }
      } else {
        setUserProfile({
          uid: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          interview_history: [],
          total_interviews: 0,
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleStartInterview = () => {
    if (!userProfile) {
      toast.error('Please wait for profile to load');
      return;
    }
    setOpenModeDialog(true);
  };

  const handleModeSelect = async () => {
    if (!auth.currentUser) return;
    try {
      const session = await startInterview(auth.currentUser.uid, selectedMode);
      localStorage.setItem('interviewSession', JSON.stringify(session));
      localStorage.setItem('interviewMode', selectedMode);
      navigate('/interview');
    } catch (error) {
      toast.error('Failed to start interview');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (profileLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Score processing logic is removed as the chart is gone.

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontSize: '0.85rem'}}>
              PrepTalk
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
              Smart Prep. Smarter You.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={() => setShowProfile(true)}>
                <AccountCircle />
              </IconButton>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Profile</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={() => setShowHistory(true)}>
                <HistoryIcon />
              </IconButton>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>History</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={handleLogout}>
                <ExitToApp />
              </IconButton>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Sign Out</Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h2" gutterBottom sx={{ fontFamily: 'Oswald, sans-serif' }}>
                Welcome to PrepTalk
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontFamily: 'Roboto, sans-serif' }}>
                Hi {userProfile?.name}, ready to ace your next interview?
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={handleStartInterview}
                sx={{ mt: 2 }}
              >
                Start Interview
              </Button>
            </Paper>
          </Grid>

          {/* Interview Modes */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #9b139bff' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Interview Modes</Typography>
                <List dense disablePadding>
                  {['Voice-to-Voice: Speak and listen to responses', 'Voice-to-Text: Speak and read responses', 'Text-to-Text: Type and read responses'].map((mode, i) => (
                    <ListItem disableGutters sx={{ py: 0.5 }} key={i}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={mode} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Interview Rounds */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #1976d2' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Interview Rounds</Typography>
                <List dense disablePadding>
                  {['HR Round: 10 questions', 'Technical Round: 10 questions', 'Management Round: 10 questions'].map((round, i) => (
                    <ListItem disableGutters sx={{ py: 0.5 }} key={i}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={round} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Tips */}
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #de81efff' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Tips</Typography>
                <List dense disablePadding>
                  {['Use the STAR method to structure your answers.','Pause briefly before answering to stay confident.','Keep answers concise and highlight key points.'].map((tip, i) => (
                    <ListItem disableGutters sx={{ py: 0.5 }} key={i}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={tip} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Score Progress Line Chart - REMOVED */}
          {/* <Grid item xs={12}>...</Grid> */}

        </Grid>
      </Container>

      {/* Mode Selection Dialog */}
      <Dialog open={openModeDialog} onClose={() => setOpenModeDialog(false)}>
        <DialogTitle>Select Interview Mode</DialogTitle>
        <DialogContent>
          <RadioGroup value={selectedMode} onChange={(e) => setSelectedMode(e.target.value as InterviewMode)}>
            <FormControlLabel value={InterviewMode.VOICE_TO_VOICE} control={<Radio />} label="Voice-to-Voice" />
            <FormControlLabel value={InterviewMode.VOICE_TO_TEXT} control={<Radio />} label="Voice-to-Text" />
            <FormControlLabel value={InterviewMode.TEXT_TO_TEXT} control={<Radio />} label="Text-to-Text" />
          </RadioGroup>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenModeDialog(false)} sx={{ mr: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleModeSelect}>Start</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* History and Profile Dialogs */}
      <History open={showHistory} onClose={() => setShowHistory(false)} />
      <Profile
        open={showProfile}
        onClose={() => { setShowProfile(false); loadUserProfile(); }}
        userProfile={userProfile}
      />
    </>
  );
};

export default Dashboard;