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
  FormControl, 
  InputLabel, 
  CircularProgress, 
  Box, 
  Grid, 
  Typography 
} from '@mui/material';
import { 
  updateProblemAreaWorkout, 
  uploadImageAndGetURL, 
  getAllProblemAreaCategories, 
  updateProblemAreaCategoryImage,
  initialProblemAreaCategories 
} from '../../firebase/problemAreaService';

const EditProblemAreaWorkoutDialog = ({ open, onClose, workout, workoutId }) => {
  const [problemAreaCategories, setProblemAreaCategories] = useState([]);
  const [newProblemAreaCategory, setNewProblemAreaCategory] = useState('');
  const [newProblemAreaCategoryDescription, setNewProblemAreaCategoryDescription] = useState('');
  const [problemAreaCategoryImage, setProblemAreaCategoryImage] = useState(null);
  const [isCategoryImageLoading, setIsCategoryImageLoading] = useState(false);  

  const [editedWorkout, setEditedWorkout] = useState({
    id: workoutId || '',
    name: workout?.name || '',
    problemAreaCategory: workout?.problemAreaCategory || '',
    problemAreaCategoryDescription: workout?.problemAreaCategoryDescription || '',
    description: workout?.description || '',
    imageUrl: workout?.imageUrl || '',
    imageFile: null,
    gifUrl: workout?.gifUrl || '',
    gifFile: null,
  });
  const [imagePreview, setImagePreview] = useState(workout?.imageUrl || '');
  const [gifPreview, setGifPreview] = useState(workout?.gifUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProblemAreaCategories = async () => {
      try {
        const categories = await getAllProblemAreaCategories();
        setProblemAreaCategories(categories);
        if (workout?.problemAreaCategory) {
          const selectedCategory = categories.find(cat => cat.name === workout.problemAreaCategory);
          setProblemAreaCategoryImage(selectedCategory ? selectedCategory.imageUrl : null);
        }
      } catch (error) {
        console.error("Error fetching problem area categories:", error);
        setProblemAreaCategories(initialProblemAreaCategories);
      }
    };
    fetchProblemAreaCategories();

    setEditedWorkout(prevState => ({
      ...prevState,
      id: workout?.id || '',
      name: workout?.name || '',
      problemAreaCategory: workout?.problemAreaCategory || '',
      problemAreaCategoryDescription: workout?.problemAreaCategoryDescription || '',
      description: workout?.description || '',
      imageUrl: workout?.imageUrl || '',
      imageFile: null,
      gifUrl: workout?.gifUrl || '',
      gifFile: null,
    }));
    setImagePreview(workout?.imageUrl || '');
    setGifPreview(workout?.gifUrl || '');
  }, [workout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedWorkout(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (name === 'problemAreaCategory') {
      const selectedCategory = problemAreaCategories.find(cat => cat.name === value);
      setProblemAreaCategoryImage(selectedCategory ? selectedCategory.imageUrl : null);
      setEditedWorkout(prevState => ({
        ...prevState,
        problemAreaCategoryDescription: selectedCategory ? selectedCategory.description : ''
      }));
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedWorkout(prevState => ({
        ...prevState,
        imageFile: file,
        imageUrl: ''
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGifFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedWorkout(prevState => ({
        ...prevState,
        gifFile: file,
        gifUrl: ''
      }));
      setGifPreview(URL.createObjectURL(file));
    }
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && editedWorkout.problemAreaCategory) {
      setIsCategoryImageLoading(true);    
      try {
        const imageUrl = await updateProblemAreaCategoryImage(editedWorkout.problemAreaCategory, file);
        setProblemAreaCategoryImage(imageUrl);
        setProblemAreaCategories(prevCategories => prevCategories.map(cat => 
          cat.name === editedWorkout.problemAreaCategory ? { ...cat, imageUrl } : cat
        ));
      } catch (error) {
        console.error("Error uploading problem area category image:", error);
      } finally {
        setIsCategoryImageLoading(false);
      }
    }
  };

  const handleAddProblemAreaCategoryClick = () => {
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
      setEditedWorkout(prevState => ({ 
        ...prevState, 
        problemAreaCategory: newProblemAreaCategory,
        problemAreaCategoryDescription: newProblemAreaCategoryDescription || ''
      }));
      
      setNewProblemAreaCategory('');
      setNewProblemAreaCategoryDescription('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let updatedWorkout = { ...editedWorkout };
      
      // Handle image upload
      if (updatedWorkout.imageFile) {
        const downloadURL = await uploadImageAndGetURL(
          updatedWorkout.imageFile,
          updatedWorkout.problemAreaCategory,
          updatedWorkout.name,
          `${updatedWorkout.id}_image`
        );
        updatedWorkout.imageUrl = downloadURL;
      }

      // Handle GIF upload
      if (updatedWorkout.gifFile) {
        const downloadURL = await uploadImageAndGetURL(
          updatedWorkout.gifFile,
          updatedWorkout.problemAreaCategory,
          updatedWorkout.name,
          `${updatedWorkout.id}_gif`
        );
        updatedWorkout.gifUrl = downloadURL;
      }

      const newWorkout = await updateProblemAreaWorkout(
        updatedWorkout.id,
        updatedWorkout,
        workout?.problemAreaCategory
      );
      onClose(newWorkout);
    } catch (error) {
      console.error("Error updating problem area workout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>Edit Problem Area Workout</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <form sx={{ mt: "10px" }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ mt: "-8px" }}>Problem Area Category</InputLabel>
                  <Select
                    name="problemAreaCategory"
                    value={editedWorkout.problemAreaCategory}
                    onChange={handleChange}
                  >
                    {problemAreaCategories.map((category) => (
                      <MenuItem key={category.name} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {problemAreaCategoryImage && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img 
                      src={problemAreaCategoryImage} 
                      alt="Category Cover" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} 
                    />
                  </Box>
                )}
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  disabled={!editedWorkout.problemAreaCategory || isCategoryImageLoading}
                >
                  {isCategoryImageLoading ? 'Uploading...' : 'Upload Category Image'}
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleCategoryImageUpload} 
                  />
                </Button>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="newProblemAreaCategory"
                  label="Add New Problem Area Category"
                  value={newProblemAreaCategory}
                  onChange={(e) => setNewProblemAreaCategory(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  name="newProblemAreaCategoryDescription"
                  label="Category Description"
                  multiline
                  rows={3}
                  value={newProblemAreaCategoryDescription}
                  onChange={(e) => setNewProblemAreaCategoryDescription(e.target.value)}
                />
                <Button 
                  onClick={handleAddProblemAreaCategoryClick} 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Add Problem Area Category
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="name"
                  label="Workout Name"
                  value={editedWorkout.name}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="description"
                  label="Workout Description"
                  multiline
                  rows={4}
                  value={editedWorkout.description}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Upload Workout Image
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageFileChange} 
                  />
                </Button>
                {imagePreview && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img 
                      src={imagePreview} 
                      alt="Workout Preview" 
                      style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }} 
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Upload Workout GIF
                  <input 
                    type="file" 
                    hidden 
                    accept="image/gif" 
                    onChange={handleGifFileChange} 
                  />
                </Button>
                {gifPreview && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img 
                      src={gifPreview} 
                      alt="Workout GIF" 
                      style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }} 
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={isLoading || !editedWorkout.name || !editedWorkout.problemAreaCategory}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProblemAreaWorkoutDialog;