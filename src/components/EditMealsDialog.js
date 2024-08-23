import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Box, Grid } from '@mui/material';
import { updateMeal, uploadImageAndGetURL } from '../firebase/mealsService'; // Updated import path

const EditMealsDialog = ({ open, onClose, meal, mealId }) => {
  const initialDietTypes = ['Keto', 'Paleo', 'Traditional', 'Vegan', 'Vegetarian'];
  const [dietTypes, setDietTypes] = useState(initialDietTypes);
  const [newDietType, setNewDietType] = useState('');

  const [editedMeal, setEditedMeal] = useState({
    id: mealId || '',
    name: meal?.name || '',
    dietType: meal?.dietType,
    mealTime: meal?.mealTime || '',
    ingredients: meal?.ingredients || '',
    instructions: meal?.instructions || '',
    imageUrl: meal?.imageUrl || '',
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState(meal?.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
     if (meal && meal.dietType && !dietTypes.includes(meal.dietType)) {
      setDietTypes(prevTypes => [...new Set([...prevTypes, meal.dietType])]);
    }
    setEditedMeal(prevState => ({
      ...prevState,
      id: meal?.id || '',
      name: meal?.name || '',
      dietType: meal?.dietType || '',
      mealTime: meal?.mealTime || '',
      ingredients: meal?.ingredients || '',
      instructions: meal?.instructions || '',
      imageUrl: meal?.imageUrl || '',
      imageFile: null // Reset imageFile when meal changes
    }));
    setImagePreview(meal?.imageUrl || '');
  }, [meal, dietTypes]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMeal(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedMeal(prevState => ({
        ...prevState,
        imageFile: file,
        imageUrl: '' // Clear the imageUrl when a new file is selected
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let updatedMeal = { ...editedMeal };
      if (updatedMeal.imageFile) {
        const imageUrl = await uploadImageAndGetURL(
          updatedMeal.imageFile,
          `meals/${updatedMeal.dietType}/meals/${updatedMeal.mealTime}/${updatedMeal.id || ''}`
        );
        updatedMeal.imageUrl = imageUrl;
      }
      const newMeal = await updateMeal(
        updatedMeal.id,
        updatedMeal,
        meal?.dietType,
        meal?.mealTime
      );
      onClose(newMeal);
    } catch (error) {
      console.error("Error updating meal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDietTypeClick = () => {
    if (newDietType && !dietTypes.includes(newDietType)) {
      setDietTypes(prevTypes => [...new Set([...prevTypes, newDietType])]);
      setEditedMeal(prevState => ({
        ...prevState,
        dietType: newDietType
      }));
      setNewDietType('');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>Edit Meal</DialogTitle>
      <DialogContent>
        <form sx={{ mt: "10px" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ mt: "-8px" }}>Diet Type</InputLabel>
                <Select
                  name="dietType"
                  value={editedMeal.dietType}
                  onChange={handleChange}
                >
                  {dietTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                name="newDietType"
                label="Add New Diet Type"
                value={newDietType}
                onChange={(e) => setNewDietType(e.target.value)}
              />
              <Button onClick={handleAddDietTypeClick} variant="outlined" fullWidth sx={{ mt: 2 }}>
                Add Diet Type
              </Button>
            </Grid>
          </Grid>
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ mt: "-8px" }}>Meal Time</InputLabel>
            <Select
              name="mealTime"
              value={editedMeal.mealTime}
              onChange={handleChange}
            >
              <MenuItem value="breakfast">Breakfast</MenuItem>
              <MenuItem value="lunch">Lunch</MenuItem>
              <MenuItem value="dinner">Dinner</MenuItem>
              <MenuItem value="snacks">Snacks</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            name="name"
            label="Meal Name"
            value={editedMeal.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="ingredients"
            label="Ingredients"
            multiline
            rows={4}
            value={editedMeal.ingredients}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="instructions"
            label="Instructions"
            multiline
            rows={4}
            value={editedMeal.instructions}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="imageUrl"
            label="Image URL"
            value={editedMeal.imageUrl}
            onChange={handleChange}
            disabled
          />
           <Button variant="contained" component="label">
            Upload Image
            <input type="file" hidden onChange={handleFileChange} accept="image/*" />
          </Button>
          {imagePreview && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <img
                src={imagePreview}
                alt="Meal Preview"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </div>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMealsDialog;