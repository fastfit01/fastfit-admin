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
import { v4 as uuidv4 } from 'uuid';
import { 
  addProblemAreaWorkout, 
  getAllProblemAreaCategories, 
  uploadImageAndGetURL, 
  updateProblemAreaCategoryImage,
  initialProblemAreaCategories 
} from '../../firebase/problemAreaService';

const AddProblemAreaWorkoutDialog = ({ open, onClose }) => {
  const [problemAreaWorkout, setProblemAreaWorkout] = useState({
    id: uuidv4(),
    problemAreaCategory: '',
    problemAreaCategoryDescription: '',
    name: '',
    description: '',
    imageUrl: null,
    imageFile: null,
    gifUrl: null,
    gifFile: null,
  });

  const [problemAreaCategories, setProblemAreaCategories] = useState([]);
  const [newProblemAreaCategory, setNewProblemAreaCategory] = useState('');
  const [newProblemAreaCategoryDescription, setNewProblemAreaCategoryDescription] = useState('');
  const [isAddingProblemAreaCategory, setIsAddingProblemAreaCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryImageLoading, setIsCategoryImageLoading] = useState(false);
  const [categoryCoverImage, setCategoryCoverImage] = useState(null);

  useEffect(() => {
    const fetchProblemAreaCategories = async () => {
      try {
        const categories = await getAllProblemAreaCategories();
        setProblemAreaCategories(categories);
      } catch (error) {
        console.error("Error fetching problem area categories:", error);
        setProblemAreaCategories(initialProblemAreaCategories);
      }
    };
    fetchProblemAreaCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblemAreaWorkout(prev => ({ 
      ...prev, 
      [name]: value 
    }));

    if (name === 'problemAreaCategory') {
      const selectedCategory = problemAreaCategories.find(cat => cat.name === value);
      setCategoryCoverImage(selectedCategory ? selectedCategory.imageUrl : null);
      setProblemAreaWorkout(prev => ({ 
        ...prev, 
        problemAreaCategoryDescription: selectedCategory ? selectedCategory.description : '' 
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setProblemAreaWorkout({
      ...problemAreaWorkout,
      imageUrl: URL.createObjectURL(file),
      imageFile: file,
    });
  };

  const handleGifUpload = (e) => {
    const file = e.target.files[0];
    setProblemAreaWorkout({
      ...problemAreaWorkout,
      gifUrl: URL.createObjectURL(file),
      gifFile: file,
    });
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    setIsCategoryImageLoading(true);
    try {
      const imageUrl = await updateProblemAreaCategoryImage(problemAreaWorkout.problemAreaCategory, file);
      setCategoryCoverImage(imageUrl);
      // Update the problemAreaCategories state to reflect the new image URL
      setProblemAreaCategories(prevCategories => prevCategories.map(cat =>
        cat.name === problemAreaWorkout.problemAreaCategory ? { ...cat, imageUrl } : cat
      ));
    } catch (error) {
      console.error("Error uploading problem area category cover image:", error);
    } finally {
      setIsCategoryImageLoading(false);
    }
  };

  const handleAddCategoryClick = () => {
    setIsAddingProblemAreaCategory(true);
  };

  const handleAddNewProblemAreaCategory = () => {
    if (
      newProblemAreaCategory.trim() !== '' && 
      !problemAreaCategories.some(cat => cat.name === newProblemAreaCategory)
    ) {
      const newCategory = { 
        name: newProblemAreaCategory, 
        description: newProblemAreaCategoryDescription || '',
        imageUrl: '' 
      };
      
      setProblemAreaCategories([...problemAreaCategories, newCategory]);
      setProblemAreaWorkout(prev => ({ 
        ...prev, 
        problemAreaCategory: newProblemAreaCategory,
        problemAreaCategoryDescription: newProblemAreaCategoryDescription || ''
      }));
      
      setNewProblemAreaCategory('');
      setNewProblemAreaCategoryDescription('');
      setIsAddingProblemAreaCategory(false);
    }
  };

  const handleSubmit = async () => {
    const { 
      problemAreaCategory, 
      problemAreaCategoryDescription,
      name, 
      description, 
      imageFile, 
      gifFile, 
      id 
    } = problemAreaWorkout;

    if (!problemAreaCategory || !name || !description) {
      console.error("Error: Missing required fields");
      return;
    }
    setIsLoading(true);

    let imageUrl = '';
    let gifUrl = '';

    if (imageFile) {
      imageUrl = await uploadImageAndGetURL(
        imageFile,
        problemAreaCategory,
        name,
        `${id}_image`
      );
    }

    if (gifFile) {
      gifUrl = await uploadImageAndGetURL(
        gifFile,
        problemAreaCategory,
        name,
        `${id}_gif`
      );
    }

    const problemAreaWorkoutData = {
      id,
      name,
      description,
      imageUrl,
      gifUrl,
      problemAreaCategory,
      problemAreaCategoryDescription,
    };

    try {
      const createdProblemAreaWorkout = await addProblemAreaWorkout(problemAreaWorkoutData);
      onClose(createdProblemAreaWorkout);
    } catch (error) {
      console.error('Error adding problem area workout:', error);
    } finally {
      setIsLoading(false);
      setProblemAreaWorkout({
        id: uuidv4(),
        problemAreaCategory: '',
        problemAreaCategoryDescription: '',
        name: '',
        description: '',
        imageUrl: null,
        imageFile: null,
        gifUrl: null,
        gifFile: null,
      });
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>Add New Problem Area Workout</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: "10px" }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ mt: "-8px" }}>Problem Area Category</InputLabel>
                <Select
                  name="problemAreaCategory"
                  value={problemAreaWorkout.problemAreaCategory}
                  onChange={handleChange}
                  disabled={problemAreaCategories.length === 0}
                >
                  {problemAreaCategories.map((category) => (
                    <MenuItem key={category.name} value={category.name}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={handleAddCategoryClick} variant="outlined" fullWidth sx={{ mt: 2 }}>
                Add Category
              </Button>
            </Grid>
            {isAddingProblemAreaCategory && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Problem Area Category"
                  value={newProblemAreaCategory}
                  onChange={(e) => setNewProblemAreaCategory(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Category Description"
                  multiline
                  rows={3}
                  value={newProblemAreaCategoryDescription}
                  onChange={(e) => setNewProblemAreaCategoryDescription(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button 
                  onClick={handleAddNewProblemAreaCategory} 
                  variant="contained" 
                  fullWidth
                >
                  Add New Category
                </Button>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Problem Area Workout Name"
                value={problemAreaWorkout.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={4}
                value={problemAreaWorkout.description}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                Upload Workout Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {problemAreaWorkout.imageUrl && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img 
                    src={problemAreaWorkout.imageUrl} 
                    alt="Uploaded" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
              >
                Upload Workout GIF
                <input
                  type="file"
                  hidden
                  accept="image/gif"
                  onChange={handleGifUpload}
                />
              </Button>
              {problemAreaWorkout.gifUrl && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img 
                    src={problemAreaWorkout.gifUrl} 
                    alt="Uploaded GIF" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                </Box>
              )}
            </Grid>
            {problemAreaWorkout.problemAreaCategory && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={isCategoryImageLoading}
                >
                  {isCategoryImageLoading ? 'Uploading...' : 'Upload Category Cover Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleCategoryImageUpload}
                  />
                </Button>
                {categoryCoverImage && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img 
                      src={categoryCoverImage} 
                      alt="Category Cover" 
                      style={{ maxWidth: '200px', maxHeight: '200px' }} 
                    />
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={!problemAreaWorkout.problemAreaCategory || !problemAreaWorkout.name || !problemAreaWorkout.description}
        >
          Add Problem Area Workout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProblemAreaWorkoutDialog;