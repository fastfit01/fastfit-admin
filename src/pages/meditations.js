import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Fab, Box, Chip, Card, CardContent, CardMedia, CircularProgress, DialogContent, Dialog } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import AddMeditationDialog from '../components/AddMeditationDialog';
import EditMeditationDialog from '../components/EditMeditationDialog';
import { getMeditations, deleteMeditation } from '../firebase/meditationService';

const Meditations = () => {
  const [meditations, setMeditations] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMeditations = async () => {
      setIsLoading(true);
      const meditationsData = await getMeditations();
      setMeditations(meditationsData);
      setIsLoading(false);
    };
    fetchMeditations();
  }, []);

  const handleAddClick = () => {
    setOpenAddDialog(true);
  };

  const handleEditClick = (meditation) => {
    setSelectedMeditation(meditation);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = async (meditationId) => {
    if (window.confirm('Are you sure you want to delete this meditation?')) {
      setIsLoading(true);
      await deleteMeditation(meditationId);
      setMeditations(meditations.filter(m => m.id !== meditationId));
      setIsLoading(false);
    }
  };

  const handleAddDialogClose = (newMeditation) => {
    setOpenAddDialog(false);
    if (newMeditation) {
      setMeditations([...meditations, newMeditation]);
    }
  };

  const handleEditDialogClose = (updatedMeditation) => {
    setOpenEditDialog(false);
    if (updatedMeditation) {
      setMeditations(meditations.map(m => m.id === updatedMeditation.id ? updatedMeditation : m));
    }
    setSelectedMeditation(null);
  };

  if (isLoading) {
    return (

      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Box>

    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Typography variant="h4" gutterBottom>Meditations</Typography>
        <List>
          {meditations.map((meditation) => (
            <ListItem key={meditation.id}>
              <Card style={{ display: 'flex', width: '100%' }}>
                {/* Left side - Image and audio */}
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                  {meditation.imageUrl && (
                    <CardMedia
                      component="img"
                      image={meditation.imageUrl}
                      alt={meditation.title}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '10%', marginTop: 16 }}
                    />
                  )}
                  {meditation.audioUrl && (
                    <audio controls style={{ marginTop: 8, width: '90%' }}>
                      <source src={meditation.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </Box>

                {/* Right side - Meditation details */}
                <CardContent style={{ flex: 1 }}>
                  <ListItemText
                    primary={meditation.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {meditation.duration && `Duration: ${meditation.duration} minutes`}
                          {meditation.duration && meditation.difficulty && ' | '}
                          {meditation.difficulty && `Difficulty: ${meditation.difficulty}`}
                        </Typography>
                        <br />
                        {meditation.tags && meditation.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" style={{ marginRight: 4, marginBottom: 4 }} />
                        ))}
                      </>
                    }
                  />
                </CardContent>

                {/* Action Buttons */}
                <ListItemSecondaryAction sx={{ mr: "25px" }}>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(meditation)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(meditation.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </Card>
            </ListItem>
          ))}
        </List>
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Fab color="primary" aria-label="add" onClick={handleAddClick}>
            <AddIcon />
          </Fab>
        </Box>
        <AddMeditationDialog open={openAddDialog} onClose={handleAddDialogClose} />
        {selectedMeditation && (
          <EditMeditationDialog
            open={openEditDialog}
            onClose={handleEditDialogClose}
            meditation={selectedMeditation}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default Meditations;
