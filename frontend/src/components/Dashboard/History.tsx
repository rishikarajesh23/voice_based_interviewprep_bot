import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { getInterviewHistory } from '../../services/api';
import { auth } from '../../services/firebase';


interface HistoryProps {
  open: boolean;
  onClose: () => void;
}


const History: React.FC<HistoryProps> = ({ open, onClose }) => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (open && auth.currentUser) {
      loadHistory();
    }
  }, [open]);


  const loadHistory = async () => {
    if (!auth.currentUser) return;
   
    setLoading(true);
    try {
      const history = await getInterviewHistory(auth.currentUser.uid);
      setInterviews(history);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Interview History
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
          <Typography>Loading...</Typography>
        ) : interviews.length === 0 ? (
          <Typography>No interviews found</Typography>
        ) : (
          <List>
            {interviews.map((interview, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        Interview #{interviews.length - index}
                      </Typography>
                      <Chip
                        label={interview.mode}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date: {formatDate(interview.ended_at)}
                      </Typography>
                      {interview.feedback && (
                        <Typography variant="body2" color="text.secondary">
                          Overall Score: {interview.feedback.overall_score}/5
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};


export default History;
