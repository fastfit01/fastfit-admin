import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Box, Grid, Typography } from '@mui/material';
import { updateMeal, uploadImageAndGetURL, getAllDietTypes, updateDietTypeCoverImage } from '../firebase/mealsService';

const EditMealsDialog = ({ open, onClose, meal, mealId }) => {
  const [dietTypes, setDietTypes] = useState([]);
  const [newDietType, setNewDietType] = useState('');
  const [dietTypeCoverImage, setDietTypeCoverImage] = useState(null);

  const [editedMeal, setEditedMeal] = useState({
    id: mealId || '',
    name: meal?.name || '',
    dietType: meal?.dietType || '',
    mealTime: meal?.mealTime || '',
    ingredients: meal?.ingredients || '',
    instructions: meal?.instructions || '',
    imageUrl: meal?.imageUrl || '',
    imageFile: null,
    mealDuration: meal?.mealDuration || ''
  });
  const [imagePreview, setImagePreview] = useState(meal?.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDietTypes = async () => {
      try {
        const types = await getAllDietTypes();
        setDietTypes(types);
        if (meal?.dietType) {
          const selectedDietType = types.find(dt => dt.name === meal.dietType);
          setDietTypeCoverImage(selectedDietType ? selectedDietType.imageUrl : null);
        }
      } catch (error) {
        console.error("Error fetching diet types:", error);
      }
    };
    fetchDietTypes();

    setEditedMeal(prevState => ({
      ...prevState,
      id: meal?.id || '',
      name: meal?.name || '',
      dietType: meal?.dietType || '',
      mealTime: meal?.mealTime || '',
      ingredients: meal?.ingredients || '',
      instructions: meal?.instructions || '',
      imageUrl: meal?.imageUrl || '',
      imageFile: null,
      mealDuration:meal?.mealDuration || ''
    }));
    setImagePreview(meal?.imageUrl || '');
  }, [meal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMeal(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (name === 'dietType') {
      const selectedDietType = dietTypes.find(dt => dt.name === value);
      setDietTypeCoverImage(selectedDietType ? selectedDietType.imageUrl : null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedMeal(prevState => ({
        ...prevState,
        imageFile: file,
        imageUrl: ''
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDietTypeCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && editedMeal.dietType) {
      setIsLoading(true);
      try {
        const imageUrl = await updateDietTypeCoverImage(editedMeal.dietType, file);
        setDietTypeCoverImage(imageUrl);
        setDietTypes(prevTypes => prevTypes.map(dt => 
          dt.name === editedMeal.dietType ? { ...dt, imageUrl } : dt
        ));
      } catch (error) {
        console.error("Error uploading diet type cover image:", error);
      } finally {
        setIsLoading(false);
      }
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
          `meals/${updatedMeal.dietType}/mealsData/${updatedMeal.mealTime}/${updatedMeal.id || ''}`
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
    if (newDietType && !dietTypes.some(dt => dt.name === newDietType)) {
      setDietTypes(prevTypes => [...prevTypes, { name: newDietType, imageUrl: '' }]);
      setEditedMeal(prevState => ({
        ...prevState,
        dietType: newDietType
      }));
      setNewDietType('');
      setDietTypeCoverImage(null);
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
                    <MenuItem key={type.name} value={type.name}>
                      {type.name}
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
            name="mealDuration"
            label="Meal Duration"
            value={editedMeal.mealDuration}
            onChange={handleChange}
          />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button variant="contained" component="label">
                Upload Meal Image
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </Button>
              {imagePreview && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Meal Image Preview:</Typography>
                  <img
                    src={imagePreview}
                    alt="Meal Preview"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                component="label"
                disabled={!editedMeal.dietType}
              >
                Upload Diet Type Cover Image
                <input type="file" hidden onChange={handleDietTypeCoverImageUpload} accept="image/*" />
              </Button>
              {dietTypeCoverImage && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Diet Type Cover Image:</Typography>
                  <img
                    src={dietTypeCoverImage}
                    alt="Diet Type Cover"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
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