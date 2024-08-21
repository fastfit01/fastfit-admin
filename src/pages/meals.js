import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, CardMedia, Fab, IconButton, Box, CircularProgress } from '@mui/material';
import { getMeals, deleteMeal } from '../firebase/mealsService'; // Updated import path
import AddMealsDialog from '../components/addMealsDialog'; // Note the capitalization
import EditMealsDialog from '../components/EditMealsDialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);
 
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

  const handleAddDialogClose = (newMeal) => {  
    setOpenAddDialog(false);
  
    if (newMeal) {
      setIsLoading(true);
      try {
        setMeals([...meals, newMeal]);
      } catch (error) {
        console.error("Error adding program:", error);
      }finally{
        setIsLoading(!true);
      }   
    } 
  };

  const handleEditDialogClose = (updatedMeal) => {
    setOpenEditDialog(false);
  
    if (updatedMeal) {
      setIsLoading(true);
      try {
        setMeals(meals.map(m => m.id === updatedMeal.id ? updatedMeal : m));
      } catch (error) {
        console.error("Error updating meal:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setSelectedMeal(null);
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
        <div>
          <Grid container spacing={2}>
            {meals.map((meal) => (
              <Grid item xs={12} sm={6} md={4} key={meal.id}>
                <Card>
                  {meal?.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={meal.imageUrl}
                      alt={meal.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg'; // Replace with your placeholder image path
                      }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{meal.name}</Typography>
                    <Typography variant="body2">
                      {`${meal.dietType} - ${meal.mealTime}`}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <IconButton onClick={() => handleEditMeal(meal)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteMeal(meal)} color="secondary">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
            <Fab color="primary" aria-label="add" onClick={handleAddMeal}>
              <AddIcon />
            </Fab>
          </Box>

          <AddMealsDialog open={openAddDialog} onClose={handleAddDialogClose} />
          {selectedMeal && (
            <EditMealsDialog
              open={openEditDialog}
              onClose={handleEditDialogClose}
              meal={selectedMeal}
              mealId={selectedMeal.id}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Meals;