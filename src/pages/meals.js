import React, { useState, useEffect, Suspense } from 'react';
import { Grid, Card, CardContent, Typography, CardMedia, Fab, IconButton, Box, CircularProgress, Container, Tooltip, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { getMeals, deleteMeal, updateMeal, deleteDietType, getAllDietTypes } from '../firebase/mealsService';  
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import SearchField from '../components/SearchField';
import TabPanel from '../components/TabPanel';

// Dynamically import dialogs
const AddMealsDialog = dynamic(() => import('../components/addMealsDialog'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const EditMealsDialog = dynamic(() => import('../components/EditMealsDialog'), {
  loading: () => <CircularProgress />,
  ssr: false
});

// Lazy load the MealCard component
const MealCard = dynamic(() => import('../components/MealCard'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
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
        const types = await getAllDietTypes();
        setCategories(types.map(type => type.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
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
        const types = await getAllDietTypes();
        setCategories(types.map(type => type.name));
      } catch (error) {
        console.error("Error after adding meal:", error);
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    fetchMeals();
  };

  const filteredMealsByCategory = (meals, category) => {
    return meals.filter(meal =>
      meal.dietType === category &&
      (meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       meal.mealTime.toLowerCase().includes(searchTerm.toLowerCase()))
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
        await deleteDietType(categoryToDelete);
        const types = await getAllDietTypes();
        setCategories(types.map(type => type.name));
        setCurrentTab(0);
        await fetchMeals();
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
            Meals
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="meal categories tabs"
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
            placeholder="Search meals..."
          />

          {categories.map((category, index) => (
            <TabPanel key={category} value={currentTab} index={index}>
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <Suspense fallback={<CircularProgress />}>
                  <Grid container spacing={2}>
                    {filteredMealsByCategory(meals, category).map((meal) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={meal.id}>
                        <MealCard
                          meal={meal}
                          onEdit={() => handleEditMeal(meal)}
                          onDelete={() => handleDeleteMeal(meal)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Suspense>
              )}
            </TabPanel>
          ))}

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
          
          <AddMealsDialog 
            open={openAddDialog} 
            onClose={handleAddDialogClose}
            selectedCategory={categories[currentTab]}
            onCategoryAdded={async () => {
              const types = await getAllDietTypes();
              setCategories(types.map(type => type.name));
            }}
          />
          {selectedMeal && (
            <EditMealsDialog
              open={openEditDialog}
              onClose={handleEditDialogClose}
              meal={selectedMeal}
              mealId={selectedMeal.id}
              key={selectedMeal.id} 
            />
          )}

          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Category</DialogTitle>
            <DialogContent>
              Are you sure you want to delete the category "{categoryToDelete}"? 
              This will permanently delete all meals in this category.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Layout>
    </ProtectedRoute>
  );
};

export default Meals;
