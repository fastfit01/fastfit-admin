import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Fab, Box, Chip, Card, CardContent, CardMedia } from '@mui/material';
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

  useEffect(() => {
    const fetchMeditations = async () => {
      const meditationsData = await getMeditations();
      setMeditations(meditationsData);
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
      await deleteMeditation(meditationId);
      setMeditations(meditations.filter(m => m.id !== meditationId));
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
                  <CardMedia
                    component="img"
                    image={meditation.imageUrl} // Replace with your image URL
                    alt={meditation.title}
                    style={{ width: 100, height: 100, borderRadius: '10%', marginTop: 16 }}
                  />
                  <audio controls style={{ marginTop: 8 }}>
                    <source src={meditation.audioUrl} type="audio/mpeg" />  {/* Replace with your audio URL */}
                    Your browser does not support the audio element.
                  </audio>
                </Box>

                {/* Right side - Meditation details */}
                <CardContent style={{ flex: 1 }}>
                  <ListItemText
                    primary={meditation.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {`Duration: ${meditation.duration} minutes | Difficulty: ${meditation.difficulty}`}
                        </Typography>
                        <br />
                        {meditation.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" style={{ marginRight: 4, marginBottom: 4 }} />
                        ))}
                      </>
                    }
                  />
                </CardContent>

                {/* Action Buttons */}
                <ListItemSecondaryAction>
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
