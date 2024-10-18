import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, CardMedia, Fab, IconButton, Box, CircularProgress, Container, Tooltip } from '@mui/material';
import { getMeals, deleteMeal, updateMeal } from '../firebase/mealsService';  
import AddMealsDialog from '../components/addMealsDialog';  
import EditMealsDialog from '../components/EditMealsDialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import SearchField from '../components/SearchField';

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMeals = async () => {
    setIsLoading(true);
    try {
      const fetchedMeals = await getMeals();
      setMeals(fetchedMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleAddMeal = () => {
    setOpenAddDialog(true);
  };

  const handleEditMeal = (meal) => {    
    setSelectedMeal(meal);
    setOpenEditDialog(true);
  };

  const handleDeleteMeal = async (meal) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      setIsLoading(true);
      try {
        await deleteMeal(meal.id, meal.dietType, meal.mealTime);
        await fetchMeals();
      } catch (error) {
        console.error("Error deleting meal:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddDialogClose = async (newMeal) => {  
    setOpenAddDialog(false);
    if (newMeal) {
      setIsLoading(true);
      try {
        await fetchMeals();  
      } catch (error) {
        console.error("Error adding meal:", error);
      } finally {
        setIsLoading(false);
      }   
    } 
  };

  const handleEditDialogClose = async (updatedMeal) => {
    setOpenEditDialog(false);
  
    if (updatedMeal) {
      setIsLoading(true);
      try {
         await fetchMeals(); // Refresh the meals list
      } catch (error) {
        console.error("Error updating meal:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setSelectedMeal(null);
  };

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.dietType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.mealTime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Layout>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Meals
          </Typography>
          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meals..."
          />
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{ height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredMeals.map((meal) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={meal.id}>
                  <Card sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    maxHeight: '300px',
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
                      height="140"
                      image={meal.imageUrl || '/placeholder-meal-image.jpg'}
                      alt={meal.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 1.5, overflow: 'auto' }}>
                      <Typography variant="subtitle1" component="div" noWrap>
                        {meal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {`${meal.dietType} - ${meal.mealTime}`}
                      </Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditMeal(meal)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteMeal(meal)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <Tooltip title="Add new meal">
            <Fab 
              color="primary" 
              aria-label="add meal"
              onClick={handleAddMeal}
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
          <AddMealsDialog open={openAddDialog} onClose={handleAddDialogClose} />
          {selectedMeal && (
            <EditMealsDialog
              open={openEditDialog}
              onClose={handleEditDialogClose}
              meal={selectedMeal}
              mealId={selectedMeal.id}
              key={selectedMeal.id} 
            />
          )}
        </Container>
      </Layout>
    </ProtectedRoute>
  );
};

export default Meals;
