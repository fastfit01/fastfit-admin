import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Box, Typography, Grid, CircularProgress } from '@mui/material';
import { addMeal } from '../firebase/mealsService';
import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const dietTypes = ['Keto', 'Paleo', 'Snacks', 'Traditional', 'Vegan', 'Vegetarian'];
const mealTimes = ['breakfast', 'lunch', 'dinner'];

const AddMealsDialog = ({ open, onClose }) => {
  const [meal, setMeal] = useState({
    id: uuidv4(),
    dietType: '',
    mealTime: '',
    name: '',
    ingredients: '',
    instructions: '',
    imageUrl: null,
    imageFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeal({ ...meal, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setMeal({
      ...meal,
      imageUrl: URL.createObjectURL(file),
      imageFile: file,
    });
  };

  const handleSubmit = async () => {
    const { dietType, mealTime, name, ingredients, instructions, imageFile } = meal;

    if (!dietType || !mealTime || !name || !ingredients || !instructions) {
      console.error("Error: Missing required fields");
      return;
    }
    setIsLoading(!false);

    let imageUrl = '';

    if (imageFile) {
      const storage = getStorage();
      const storagePath = `meals/${dietType}/${mealTime}/${meal.id}/${imageFile.name}`;
      const imageRef = storageRef(storage, storagePath);

      try {
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    const mealData = {
      name,
      ingredients,
      instructions,
      imageUrl,
    };

    try {
      await addMeal(dietType, mealTime, mealData);
      console.log('Meal added successfully');
      onClose(); // Close the dialog on success
    } catch (error) {
      console.error('Error adding meal:', error);
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
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>Add New Meal</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Diet Type</InputLabel>
              <Select
                name="dietType"
                value={meal.dietType}
                onChange={handleChange}
              >
                {dietTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Meal Time</InputLabel>
              <Select
                name="mealTime"
                value={meal.mealTime}
                onChange={handleChange}
              >
                {mealTimes.map((time) => (
                  <MenuItem key={time} value={time}>{time.charAt(0).toUpperCase() + time.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="name"
              label="Meal Name"
              value={meal.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="ingredients"
              label="Ingredients"
              value={meal.ingredients}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="instructions"
              label="Instructions"
              value={meal.instructions}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="meal-image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="meal-image-upload">
              <Button variant="contained" component="span">
                Upload Image
              </Button>
            </label>
            {meal.imageUrl && (
              <Box mt={2}>
                <Typography variant="subtitle2">Image Preview:</Typography>
                <img
                  src={meal.imageUrl}
                  alt="Meal preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Add Meal</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMealsDialog;
