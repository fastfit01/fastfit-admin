import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, CircularProgress } from '@mui/material';
import { addMeditation } from '../firebase/meditationService';

const AddMeditationDialog = ({ open, onClose }) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title && duration && category && description && difficulty) {
            try {
                setIsLoading(!false);
                const newMeditation = await addMeditation({
                    title,
                    duration: parseInt(duration),
                    audioFile,
                    category,
                    description,
                    difficulty,
                    imageUrl,
                    tags
                });
                onClose(newMeditation);
            } catch (error) {
                console.error('Error adding meditation:', error);
            } finally {
                setIsLoading(false);
            }
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


    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{ height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Meditation</DialogTitle>
            <DialogContent sx={{
                display: 'flex',
                flexDirection: 'column',
                gap:"8px"
            }}>
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
                    label="Duration (minutes)"
                    type="number"
                    fullWidth
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <FormControl fullWidth margin="dense">
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
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                </FormControl>

                {/* Image Upload and Preview */}
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={(e) => setImageUrl(URL.createObjectURL(e.target.files[0]))} // Preview the image
                />
                <label htmlFor="image-upload">
                    <Button variant="contained" component="span" fullWidth style={{ marginTop: 16 }}>
                        Upload Image
                    </Button>
                </label>
                {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ width: '100%', marginTop: 16 }} />}

                {/* Tags */}
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

                {/* Audio Upload and Preview */}
                <input
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={(e) => setAudioFile(e.target.files[0])}
                />
                <label htmlFor="raised-button-file">
                    <Button variant="contained" component="span" fullWidth style={{ marginTop: 16 }}>
                        Upload Audio File
                    </Button>
                </label>
                {audioFile && <p>{audioFile.name}</p>}
                {audioFile && (
                    <audio controls style={{ marginTop: 8 }}>
                        <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    Add Meditation
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMeditationDialog;
