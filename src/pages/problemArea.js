import React, { useState, useEffect, Suspense } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardMedia, 
  Fab, 
  IconButton, 
  Box, 
  CircularProgress, 
  Container, 
  Tooltip, 
  Tabs, 
  Tab, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button 
} from '@mui/material';
import { 
  getProblemAreaWorkouts, 
  deleteProblemAreaWorkout, 
  updateProblemAreaWorkout, 
  deleteProblemAreaCategory, 
  getAllProblemAreaCategories 
} from '../firebase/problemAreaService';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import SearchField from '../components/SearchField';
import TabPanel from '../components/TabPanel';

// Dynamically import dialogs
const AddProblemAreaWorkoutDialog = dynamic(() => import('../components/ProblemArea Workout/AddProblemAreaWorkoutDialog'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const EditProblemAreaWorkoutDialog = dynamic(() => import('../components/ProblemArea Workout/EditProblemAreaWorkoutDialog'), {
  loading: () => <CircularProgress />,
  ssr: false
});

// Lazy load the ProblemAreaWorkoutCard component
const ProblemAreaWorkoutCard = dynamic(() => import('../components/ProblemArea Workout/ProblemAreaWorkoutCard'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const ProblemArea = () => {
  const [problemAreaWorkouts, setProblemAreaWorkouts] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProblemAreaWorkout, setSelectedProblemAreaWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const types = await getAllProblemAreaCategories();
        setCategories(types);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchProblemAreaWorkouts = async () => {
    setIsLoading(true);
    try {
      const fetchedProblemAreaWorkouts = await getProblemAreaWorkouts();
      setProblemAreaWorkouts(fetchedProblemAreaWorkouts);
    } catch (error) {
      console.error("Error fetching problem area workouts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemAreaWorkouts();
  }, []);

  const handleAddProblemAreaWorkout = () => {
    setOpenAddDialog(true);
  };

  const handleEditProblemAreaWorkout = (workout) => {    
    setSelectedProblemAreaWorkout(workout);
    setOpenEditDialog(true);
  };

  const handleDeleteProblemAreaWorkout = async (workout) => {
    if (window.confirm('Are you sure you want to delete this problem area workout?')) {
      setIsLoading(true);
      try {
        await deleteProblemAreaWorkout(workout.id, workout.problemAreaCategory);
        await fetchProblemAreaWorkouts();
      } catch (error) {
        console.error("Error deleting problem area workout:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddDialogClose = async (newProblemAreaWorkout) => {  
    setOpenAddDialog(false);
    if (newProblemAreaWorkout) {
      setIsLoading(true);
      try {
        await fetchProblemAreaWorkouts();
        const types = await getAllProblemAreaCategories();
        setCategories(types);
      } catch (error) {
        console.error("Error after adding problem area workout:", error);
      } finally {
        setIsLoading(false);
      }   
    } 
  };

  const handleEditDialogClose = async (updatedProblemAreaWorkout) => {
    setOpenEditDialog(false);
  
    if (updatedProblemAreaWorkout) {
      setIsLoading(true);
      try {
         await fetchProblemAreaWorkouts(); // Refresh the problem area workouts list
      } catch (error) {
        console.error("Error updating problem area workout:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setSelectedProblemAreaWorkout(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    fetchProblemAreaWorkouts();
  };

  const filteredProblemAreaWorkoutsByCategory = (workouts, category) => {
    return workouts.filter(workout =>
      workout.problemAreaCategory === category &&
      (workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       workout.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      setIsLoading(true);
      try {
        await deleteProblemAreaCategory(categoryToDelete);
        const types = await getAllProblemAreaCategories();
        setCategories(types);
        setCurrentTab(0);
        await fetchProblemAreaWorkouts();
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        setIsLoading(false);
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Problem Area Workouts
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <SearchField 
              placeholder="Search Problem Area Workouts" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Tooltip title="Add Problem Area Workout">
              <Fab color="primary" onClick={handleAddProblemAreaWorkout}>
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
            >
              {categories.map((category, index) => (
                <Tooltip 
                  key={category.name} 
                  title={category.description || ''} 
                  placement="top"
                >
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {category.name}
                        {categories.length > 1 && (
                          <IconButton 
                            size="small" 
                            sx={{ ml: 1 }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category.name);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    } 
                  />
                </Tooltip>
              ))}
            </Tabs>
          </Box>

          {categories.map((category, index) => (
            <TabPanel key={category.name} value={currentTab} index={index}>
              <Grid container spacing={3}>
                {filteredProblemAreaWorkoutsByCategory(problemAreaWorkouts, category.name).map((workout) => (
                  <Grid item xs={12} sm={6} md={4} key={workout.id}>
                    <ProblemAreaWorkoutCard 
                      workout={workout} 
                      onEdit={() => handleEditProblemAreaWorkout(workout)}
                      onDelete={() => handleDeleteProblemAreaWorkout(workout)}
                    />
                  </Grid>
                ))}
                {filteredProblemAreaWorkoutsByCategory(problemAreaWorkouts, category.name).length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body1" align="center" color="textSecondary">
                      No workouts found in this category.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          ))}

          {/* Delete Category Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Category</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the category "{categoryToDelete}"? 
                This will remove all associated workouts.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="secondary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Problem Area Workout Dialog */}
          {openAddDialog && (
            <Suspense fallback={<CircularProgress />}>
              <AddProblemAreaWorkoutDialog 
                open={openAddDialog} 
                onClose={handleAddDialogClose} 
              />
            </Suspense>
          )}

          {/* Edit Problem Area Workout Dialog */}
          {openEditDialog && (
            <Suspense fallback={<CircularProgress />}>
              <EditProblemAreaWorkoutDialog 
                open={openEditDialog} 
                onClose={handleEditDialogClose} 
                workout={selectedProblemAreaWorkout}
                workoutId={selectedProblemAreaWorkout?.id}
              />
            </Suspense>
          )}
        </Container>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProblemArea;