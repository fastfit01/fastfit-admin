import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import { addMeal, getAllDietTypes, uploadImageAndGetURL, updateDietTypeCoverImage } from '../firebase/mealsService';
import { v4 as uuidv4 } from 'uuid';

const initialDietTypes = ['Keto', 'Paleo', 'Traditional', 'Vegan', 'Vegetarian'];
const mealTimes = ['breakfast', 'lunch', 'dinner', 'snacks'];

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
    mealDuration: ''
  });

  const [dietTypes, setDietTypes] = useState([]);
  const [newDietType, setNewDietType] = useState('');
  const [isAddingDietType, setIsAddingDietType] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDietTypeImageLoading, setIsDietTypeImageLoading] = useState(false);
  const [dietTypeCoverImage, setDietTypeCoverImage] = useState(null);

  useEffect(() => {
    const fetchDietTypes = async () => {
      try {
        const types = await getAllDietTypes();
        setDietTypes(types);
      } catch (error) {
        console.error("Error fetching diet types:", error);
      }
    };
    fetchDietTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeal({ ...meal, [name]: value });
    if (name === 'dietType') {
      const selectedDietType = dietTypes.find(dt => dt.name === value);
      setDietTypeCoverImage(selectedDietType ? selectedDietType.imageUrl : null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setMeal({
      ...meal,
      imageUrl: URL.createObjectURL(file),
      imageFile: file,
    });
  };

  const handleDietTypeImageUpload = async (e) => {
    const file = e.target.files[0];
    setIsDietTypeImageLoading(true);
    try {
      const imageUrl = await updateDietTypeCoverImage(meal.dietType, file);
      setDietTypeCoverImage(imageUrl);
      // Update the dietTypes state to reflect the new image URL
      setDietTypes(prevTypes => prevTypes.map(dt =>
        dt.name === meal.dietType ? { ...dt, imageUrl } : dt
      ));
    } catch (error) {
      console.error("Error uploading diet type cover image:", error);
    } finally {
      setIsDietTypeImageLoading(false);
    }
  };

  const handleAddDietTypeClick = () => {
    setIsAddingDietType(true);
  };

  const handleAddNewDietType = () => {
    if (newDietType.trim() !== '' && !dietTypes.some(dt => dt.name === newDietType)) {
      setDietTypes([...dietTypes, { name: newDietType, imageUrl: '' }]);
      setMeal({ ...meal, dietType: newDietType });
      setNewDietType('');
    }
    setIsAddingDietType(false);
  };

  const handleSubmit = async () => {
    const { dietType, mealTime, name, ingredients, instructions, imageFile, id, mealDuration } = meal;

    if (!dietType || !mealTime || !name || !ingredients || !instructions) {
      console.error("Error: Missing required fields");
      return;
    }
    setIsLoading(true);

    let imageUrl = '';

    if (imageFile) {
      imageUrl = await uploadImageAndGetURL(
        imageFile,
        dietType,
        mealTime,
        id
      );
    }

    const mealData = {
      id,
      name,
      ingredients,
      instructions,
      imageUrl,
      dietType,
      mealTime,
      mealDuration
    };

    try {
      const createdMeal = await addMeal(mealData);
      onClose(createdMeal);
    } catch (error) {
      console.error('Error adding meal:', error);
    } finally {
      setIsLoading(false);
      setMeal({
        id: uuidv4(),
        dietType: '',
        mealTime: '',
        name: '',
        ingredients: '',
        instructions: '',
        imageUrl: null,
        imageFile: null,
        mealDuration: ''
      });
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
      <DialogTitle>Add New Meal</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: "10px" }}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ mt: "-8px" }}>Diet Type</InputLabel>
              <Select
                name="dietType"
                value={meal.dietType}
                onChange={handleChange}
                disabled={dietTypes.length === 0}
              >
                {dietTypes.map((type) => (
                  <MenuItem key={type.name} value={type.name}>{type.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <Button onClick={handleAddDietTypeClick} variant="outlined" fullWidth sx={{ mt: 2 }}>
              Add Diet Type
            </Button>
          </Grid>
          {isAddingDietType && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Diet Type"
                value={newDietType}
                onChange={(e) => setNewDietType(e.target.value)}
              />
              <Button onClick={handleAddNewDietType} variant="contained" sx={{ mt: 2 }}>
                Add New Diet Type
              </Button>
            </Grid>
          )}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ mt: "-8px" }}>Meal Time</InputLabel>
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
            <TextField
              fullWidth
              multiline
              margin="normal"
              name="mealDuration"
              label="Meal Duration"
              value={meal.mealDuration}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "flex" }}>
            <Grid item xs={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="meal-image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="meal-image-upload">
                <Button variant="contained" component="span">
                  Upload Meal Image
                </Button>
              </label>
              {meal.imageUrl && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Meal Image Preview:</Typography>
                  <img
                    src={meal.imageUrl}
                    alt="Meal preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="diet-cover-image-upload"
                type="file"
                onChange={handleDietTypeImageUpload}
                disabled={!meal.dietType}
              />
              <label htmlFor="diet-cover-image-upload">
                <Button variant="contained" component="span" disabled={!meal.dietType}>
                 { isDietTypeImageLoading ? 'Uploading...' : 'Upload Diet Cover Image'}
                </Button>
              </label>
              {dietTypeCoverImage && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Diet Type Cover Image:</Typography>
                  <img
                    src={dietTypeCoverImage}
                    alt="Diet Cover image"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Grid>
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
