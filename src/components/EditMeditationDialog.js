import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, CircularProgress, Grid } from '@mui/material';
import { updateMeditation } from '../firebase/meditationService';
import { getAllMeditationCategories } from '../firebase/meditationService';

const EditMeditationDialog = ({ open, onClose, meditation }) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [category, setCategory] = useState(meditation?.category || 'focus');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    useEffect(() => {
        if (meditation) {
            setTitle(meditation.title);
            setDuration(meditation.duration.toString());
            setCategory(meditation.category);
            setDescription(meditation.description);
            setDifficulty(meditation.difficulty || ''); // Set default to empty string if undefined
            setImagePreview(meditation.imageUrl);
            setTags(meditation.tags || []);
        }

        console.log("meditation", meditation);
    }, [meditation]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const types = await getAllMeditationCategories();
                setCategories(types);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (title) {
            const updatedMeditation = await updateMeditation(meditation.id, {
                title,
                duration,
                audioFile,
                category,
                description,
                difficulty,
                imageFile,
                tags
            });
            onClose(updatedMeditation);
            setIsLoading(false);
        }
    };

    const handleAddTag = () => {
        if (currentTag && !tags.includes(currentTag)) {
            setTags([...tags, currentTag]);
            setCurrentTag('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddCategoryClick = () => {
        setIsAddingCategory(true);
    };

    const handleAddNewCategory = () => {
        if (newCategory.trim() !== '' && !categories.some(cat => cat.name === newCategory)) {
            setCategories([...categories, { name: newCategory, imageUrl: '' }]);
            setCategory(newCategory);
            setNewCategory('');
        }
        setIsAddingCategory(false);
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Meditation</DialogTitle>
            <DialogContent>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Meditation Title"
                            type="text"
                            fullWidth
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Duration"
                            fullWidth
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="dense">
                                    <InputLabel sx={{ mt: "-8px" }}>Category</InputLabel>
                                    <Select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {categories.map((type) => (
                                            <MenuItem key={type.name} value={type.name}>{type.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <Button onClick={handleAddCategoryClick} variant="outlined" fullWidth sx={{ mt: 2 }}>
                                    Add Category
                                </Button>
                            </Grid>
                            {isAddingCategory && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="New Category"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <Button onClick={handleAddNewCategory} variant="contained" sx={{ mt: 2 }}>
                                        Add New Category
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                        <TextField
                            margin="dense"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel sx={{ mt: "-8px" }}>Difficulty</InputLabel>
                            <Select
                                name="difficulty"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <MenuItem value="easy">Easy</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="hard">Hard</MenuItem>
                            </Select>
                        </FormControl>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="image-upload"
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="image-upload">
                            <Button variant="outlined" component="span" fullWidth style={{ marginTop: 16 }}>
                                Upload Image
                            </Button>
                        </label>
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100%', marginTop: 8 }} />}
                        <Box mt={2}>
                            <TextField
                                label="Add Tag"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <Button onClick={handleAddTag}>Add Tag</Button>
                        </Box>
                        <Box mt={1}>
                            {tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    style={{ margin: 4 }}
                                />
                            ))}
                        </Box>
                        <input
                            accept="audio/*"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            type="file"
                            onChange={(e) => setAudioFile(e.target.files[0])}
                        />
                        <label htmlFor="raised-button-file">
                            <Button variant="outlined" component="span" fullWidth style={{ marginTop: 16 }}>
                                Upload Audio File
                            </Button>
                        </label>
                        {audioFile && <p>{audioFile.name}</p>}

                        {/* Audio Preview */}
                        {audioFile ? (
                            <audio controls style={{ marginTop: 8, width: '100%' }}>
                                <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        ) : meditation.audioUrl ? (
                            <audio controls style={{ marginTop: 8, width: '100%' }}>
                                <source src={meditation.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        ) : null}

                    </Box>
                )
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    {isLoading ? 'Saving...' : 'Save Meditation'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditMeditationDialog;
