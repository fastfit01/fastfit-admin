import React, { useState } from 'react';
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
    Chip,
    Box,
    CircularProgress
} from '@mui/material';
import { addMeditation } from '../firebase/meditationService';

const AddMeditationDialog = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        duration: '',
        category: '',
        description: '',
        difficulty: '',
        tags: [],
        currentTag: '',
    });
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, duration, category, description, difficulty, tags } = formData;
        if (title) {
            try {
                setIsLoading(true);
                const newMeditation = await addMeditation({
                    ...formData,
                    duration: duration ? parseFloat(duration) : null,
                    audioFile,
                    imageFile,
                    tags
                });
                onClose(newMeditation);
            } catch (error) {
                console.error('Error adding meditation:', error);
            } finally {
                setIsLoading(false);
                setFormData({
                    title: '',
                    duration: '',
                    category: '',
                    description: '',
                    difficulty: '',
                    tags: [],
                    currentTag: '',
                });
                setAudioFile(null);
                setImageFile(null);
                setImagePreview('');
            }
        }
    };

    const handleAddTag = () => {
        const { currentTag, tags } = formData;
        if (currentTag && !tags.includes(currentTag)) {
            setFormData(prevData => ({
                ...prevData,
                tags: [...prevData.tags, currentTag],
                currentTag: ''
            }));
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setFormData(prevData => ({
            ...prevData,
            tags: prevData.tags.filter(tag => tag !== tagToDelete)
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'image') {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setAudioFile(file);
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Meditation</DialogTitle>
            <DialogContent>
                { isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress />
                        </Box>
                    ) :
                        (<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <TextField
                                required
                                autoFocus
                                label="Meditation Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel sx={{ mt: "-8px" }}>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="focus">Focus</MenuItem>
                                    <MenuItem value="relaxation">Relaxation</MenuItem>
                                    <MenuItem value="sleep">Sleep</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel sx={{ mt: "-8px" }}>Difficulty</InputLabel>
                                <Select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
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
                                onChange={(e) => handleFileChange(e, 'image')}
                            />
                            <label htmlFor="image-upload">
                                <Button variant="contained" component="span" fullWidth>
                                    Upload Image
                                </Button>
                            </label>
                            {imagePreview && <img src={imagePreview} alt="Uploaded" style={{ width: '100%', marginTop: 16 }} />}

                            <Box>
                                <TextField
                                    label="Add Tag"
                                    name="currentTag"
                                    value={formData.currentTag}
                                    onChange={handleChange}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <Button onClick={handleAddTag}>Add Tag</Button>
                            </Box>
                            <Box>
                                {formData.tags.map((tag, index) => (
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
                                id="audio-upload"
                                type="file"
                                onChange={(e) => handleFileChange(e, 'audio')}
                            />
                            <label htmlFor="audio-upload">
                                <Button variant="contained" component="span" fullWidth>
                                    Upload Audio File
                                </Button>
                            </label>
                            {audioFile && (
                                <>
                                    <p>{audioFile.name}</p>
                                    <audio controls style={{ width: '100%' }}>
                                        <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </>
                            )}
                        </Box>)
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    {isLoading ? 'Adding...' : 'Add Meditation'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMeditationDialog;