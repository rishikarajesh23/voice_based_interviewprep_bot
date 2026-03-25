import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import { Close, AccountCircle, EmojiEvents, TrendingUp } from '@mui/icons-material';
import { getUserProfile } from '../../services/api';
import { auth } from '../../services/firebase';


interface ProfileProps {
  open: boolean;
  onClose: () => void;
  userProfile: any;
}


const Profile: React.FC<ProfileProps> = ({ open, onClose, userProfile: initialProfile }) => {
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // Update local state when prop changes
    setUserProfile(initialProfile);
  }, [initialProfile]);


  useEffect(() => {
    if (open && auth.currentUser && !userProfile) {
      fetchLatestProfile();
    }
  }, [open]);


  const fetchLatestProfile = async () => {
    if (!auth.currentUser) return;
   
    setLoading(true);
    try {
      const profile = await getUserProfile(auth.currentUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        User Profile
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <AccountCircle sx={{ width: 60, height: 60 }} />
            </Avatar>
           
            {userProfile ? (
              <>
                <Typography variant="h6">{userProfile.name || 'User'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {userProfile.email}
                </Typography>
               
                <Divider sx={{ width: '100%', my: 2 }} />
               
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Account Statistics
                  </Typography>
                 
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEvents color="primary" />
                      <Typography variant="body1">
                        Total Interviews: <strong>{userProfile.total_interviews || userProfile.interview_history?.length || 0}</strong>
                      </Typography>
                    </Box>
                   
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="success" />
                      <Typography variant="body1">
                        Member Since: <strong>
                          {userProfile.created_at
                            ? new Date(userProfile.created_at).toLocaleDateString()
                            : 'Recently joined'}
                        </strong>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
               
                {(userProfile.total_interviews > 0 || userProfile.interview_history?.length > 0) && (
                  <>
                    <Divider sx={{ width: '100%', my: 2 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Achievement Badges
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(userProfile.total_interviews >= 1 || userProfile.interview_history?.length >= 1) && (
                          <Chip label="First Interview ✨" color="success" size="small" />
                        )}
                        {(userProfile.total_interviews >= 5 || userProfile.interview_history?.length >= 5) && (
                          <Chip label="5 Interviews 🎯" color="primary" size="small" />
                        )}
                        {(userProfile.total_interviews >= 10 || userProfile.interview_history?.length >= 10) && (
                          <Chip label="Interview Pro 🏆" color="warning" size="small" />
                        )}
                      </Box>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Typography>No profile data available</Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};


export default Profile;