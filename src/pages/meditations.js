import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Fab,
  Box,
  Chip,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Container,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import AddMeditationDialog from '../components/AddMeditationDialog';
import EditMeditationDialog from '../components/EditMeditationDialog';
import { getMeditations, deleteMeditation } from '../firebase/meditationService';
import SearchField from '../components/SearchField';

const Meditations = () => {
  const [meditations, setMeditations] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMeditations = useCallback(async () => {
    setIsLoading(true);
    try {
      const meditationsData = await getMeditations();
      setMeditations(meditationsData);
    } catch (error) {
      console.error('Error fetching meditations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  const handleAddClick = () => setOpenAddDialog(true);

  const handleEditClick = (meditation) => {
    setSelectedMeditation(meditation);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = async (meditationId) => {
    if (window.confirm('Are you sure you want to delete this meditation?')) {
      setIsLoading(true);
      try {
        await deleteMeditation(meditationId);
        setMeditations(prevMeditations => prevMeditations.filter(m => m.id !== meditationId));
      } catch (error) {
        console.error('Error deleting meditation:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddDialogClose = async (newMeditation) => {
    setOpenAddDialog(false);
    if (newMeditation) {
      setIsLoading(true);
      try {
        await fetchMeditations(); // Refresh the entire list
      } catch (error) {
        console.error('Error refreshing meditations:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditDialogClose = async (updatedMeditation) => {
    setOpenEditDialog(false);
    setSelectedMeditation(null);
    if (updatedMeditation) {
      setIsLoading(true);
      setSelectedMeditation(null);
      try {
        await fetchMeditations(); // Refresh the entire list
      } catch (error) {
        console.error('Error refreshing meditations:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredMeditations = meditations.filter(meditation =>
    meditation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (meditation.tags && meditation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <ProtectedRoute>
      <Layout>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Meditations
          </Typography>
          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meditations..."
          />
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{ height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredMeditations.map((meditation) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={meditation.id}>
                  <Card sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    maxHeight: '300px', // Limit the maximum height
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
                    },
                  }}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={meditation.imageUrl || '/placeholder-image.jpg'}
                      alt={meditation.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 1.5, overflow: 'auto' }}>
                      <Typography variant="subtitle1" component="div" noWrap>
                        {meditation.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {meditation.duration && `${meditation.duration} min`}
                        {meditation.duration && meditation.difficulty && ' • '}
                        {meditation.difficulty && `${meditation.difficulty}`}
                      </Typography>
                      <Box sx={{ mb: 0.5 }}>
                        {meditation.tags && meditation.tags.slice(0, 2).map((tag, index) => (
                          <Chip 
                            key={index} 
                            label={tag} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem', height: '16px' }} 
                          />
                        ))}
                        {meditation.tags && meditation.tags.length > 2 && (
                          <Chip 
                            label={`+${meditation.tags.length - 2}`} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem', height: '16px' }} 
                          />
                        )}
                      </Box>
                    </CardContent>
                    {meditation.audioUrl && (
                      <Box sx={{ p: 0.5, bgcolor: 'grey.100', borderRadius: '16px' }}>
                        <audio controls style={{ width: '100%', height: '24px' }}>
                          <source src={meditation.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditClick(meditation)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(meditation.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <Tooltip title="Add new meditation">
            <Fab 
              color="primary" 
              aria-label="add meditation"
              onClick={handleAddClick}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Container>
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
