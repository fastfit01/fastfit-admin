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
  Tabs,
  Tab,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import AddMeditationDialog from '../components/AddMeditationDialog';
import EditMeditationDialog from '../components/EditMeditationDialog';
import { getMeditations, deleteMeditation, getAllMeditationCategories, getMeditationsByCategory, deleteMeditationCategory } from '../firebase/meditationService';
import SearchField from '../components/SearchField';
import TabPanel from '../components/TabPanel';

const Meditations = () => {
  const [meditations, setMeditations] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const types = await getAllMeditationCategories();
        setCategories(types.map(type => type.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
        const categoryMeditations = await getMeditationsByCategory(newMeditation.category);
        
        setMeditations(prevMeditations => {
          const otherMeditations = prevMeditations.filter(m => m.category !== newMeditation.category);
          return [...otherMeditations, ...categoryMeditations];
        });
        
        if (!categories.includes(newMeditation.category)) {
          const types = await getAllMeditationCategories();
          setCategories(types.map(type => type.name));
        }
        
        const categoryIndex = categories.indexOf(newMeditation.category);
        if (categoryIndex !== -1) {
          setCurrentTab(categoryIndex);
        }
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
      try {
        const oldCategory = selectedMeditation.category;
        const newCategory = updatedMeditation.category;
        
        if (oldCategory !== newCategory) {
          const [oldCategoryData, newCategoryData] = await Promise.all([
            getMeditationsByCategory(oldCategory),
            getMeditationsByCategory(newCategory)
          ]);
          
          setMeditations(prevMeditations => {
            const otherMeditations = prevMeditations.filter(m => 
              m.category !== oldCategory && m.category !== newCategory
            );
            return [...otherMeditations, ...oldCategoryData, ...newCategoryData];
          });
        } else {
          const categoryData = await getMeditationsByCategory(newCategory);
          setMeditations(prevMeditations => {
            const otherMeditations = prevMeditations.filter(m => m.category !== newCategory);
            return [...otherMeditations, ...categoryData];
          });
        }
        
        if (!categories.includes(newCategory)) {
          const types = await getAllMeditationCategories();
          setCategories(types.map(type => type.name));
        }
        
        const categoryIndex = categories.indexOf(newCategory);
        if (categoryIndex !== -1) {
          setCurrentTab(categoryIndex);
        }
      } catch (error) {
        console.error('Error refreshing meditations:', error);
      } finally {
        setIsLoading(false);
        setSelectedMeditation(null);
      }
    }
  };

  const handleTabChange = async (event, newValue) => {
    setCurrentTab(newValue);
    const category = categories[newValue];
    
    if (!meditations.some(m => m.category === category)) {
      setLoadingStates(prev => ({ ...prev, [category]: true }));
      try {
        const meditationsData = await getMeditationsByCategory(category);
        setMeditations(prev => [...prev, ...meditationsData]);
      } catch (error) {
        console.error(`Error fetching ${category} meditations:`, error);
      } finally {
        setLoadingStates(prev => ({ ...prev, [category]: false }));
      }
    }
  };

  const filteredMeditationsByCategory = (meditations, category) => {
    return meditations.filter(meditation =>
      meditation.category === category &&
      (meditation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       meditation.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category}"? This will permanently delete all meditations in this category.`)) {
      setIsLoading(true);
      try {
        await deleteMeditationCategory(category);
        const types = await getAllMeditationCategories();
        setCategories(types.map(type => type.name));
        setCurrentTab(0);
        await fetchMeditations();
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Meditations
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="meditation categories tabs"
            >
              {categories.map((category, index) => (
                <Tab 
                  key={category} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {category}
                      {categories.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
                  id={`tab-${index}`}
                  aria-controls={`tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meditations..."
          />

          {categories.map((category, index) => (
            <TabPanel key={category} value={currentTab} index={index}>
              {isLoading || loadingStates[category] ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredMeditationsByCategory(meditations, category).map((meditation) => (
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
                            {meditation.duration && `${meditation.duration} `}
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
            </TabPanel>
          ))}

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
