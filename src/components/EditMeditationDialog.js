import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, CircularProgress } from '@mui/material';
import { updateMeditation } from '../firebase/meditationService';

const EditMeditationDialog = ({ open, onClose, meditation }) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                        <FormControl fullWidth margin="dense" >
                            <InputLabel sx={{ mt: "-8px" }}>Category</InputLabel>
                            <Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <MenuItem value="focus">Focus</MenuItem>
                                <MenuItem value="relaxation">Relaxation</MenuItem>
                                <MenuItem value="sleep">Sleep</MenuItem>
                            </Select>
                        </FormControl>
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
