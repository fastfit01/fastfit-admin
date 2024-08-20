import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Box } from '@mui/material';
import { updateMeal, uploadImageAndGetURL } from '../firebase/mealsService';

const EditMealsDialog = ({ open, onClose, meal }) => {
  const [editedMeal, setEditedMeal] = useState({
    name: '',
    dietType: '',
    mealTime: '',
    ingredients: '',
    instructions: '',
    imageUrl: '',
    imageFile: null
  });

  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (meal) {
      setEditedMeal(meal);
      setImagePreview(meal.imageUrl);
    }
  }, [meal]);

  const [isLoading, setIsLoading] = useState(false);



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
        imageFile: file
      }));
      setImagePreview(URL.createObjectURL(file)); // Update the image preview with the selected file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(!false);
    try {
      let updatedMeal = { ...editedMeal };
      if (editedMeal.imageFile) {
        const imageUrl = await uploadImageAndGetURL(editedMeal.imageFile, `meals/${editedMeal.dietType}/${editedMeal.mealTime}/${editedMeal.id}`);
        updatedMeal.imageUrl = imageUrl;
      }
      await updateMeal(updatedMeal.dietType, updatedMeal.mealTime, updatedMeal.id, updatedMeal);
      onClose();
    } catch (error) {
      console.error("Error updating meal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (

      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{height: '100vh'}}>
        <CircularProgress />
      </Box>

    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Meal</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ mt: "-8px" }}>Diet Type</InputLabel>
            <Select
              name="dietType"
              value={editedMeal.dietType}
              onChange={handleChange}
            >
              <MenuItem value="Traditional">Traditional</MenuItem>
              <MenuItem value="Keto">Keto</MenuItem>
              <MenuItem value="Vegan">Vegan</MenuItem>
              <MenuItem value="Vegetarian">Vegetarian</MenuItem>
              <MenuItem value="Paleo">Paleo</MenuItem>
            </Select>
          </FormControl>
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
            name="Ingredients"
            label="Ingredients"
            multiline
            rows={4}
            value={editedMeal.ingredients}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="Instructions"
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg'; // Replace with your placeholder image path
                }}
              />
            </div>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMealsDialog;