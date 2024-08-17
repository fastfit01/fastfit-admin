import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box } from '@mui/material';
import { updateMeditation } from '../firebase/meditationService';

const EditMeditationDialog = ({ open, onClose, meditation }) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');

    useEffect(() => {
        if (meditation) {
            setTitle(meditation.title);
            setDuration(meditation.duration.toString());
            setCategory(meditation.category);
            setDescription(meditation.description);
            setDifficulty(meditation.difficulty);
            setImageUrl(meditation.imageUrl);
            setTags(meditation.tags);
        }
    }, [meditation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title && duration && category && description && difficulty) {
            const updatedMeditation = await updateMeditation(meditation.id, {
                title,
                duration: parseInt(duration),
                audioFile,
                category,
                description,
                difficulty,
                imageUrl,
                tags
            });
            onClose(updatedMeditation);
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

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Meditation</DialogTitle>
            <DialogContent>
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
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <MenuItem value="focus">Focus</MenuItem>
                        <MenuItem value="relaxation">Relaxation</MenuItem>
                        <MenuItem value="sleep">Sleep</MenuItem>
                    </Select>
                </FormControl>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={(e) => setImageUrl(e.target.files[0])} // Save the image file
                />
                <label htmlFor="image-upload">
                    <Button variant="raised" component="span" fullWidth style={{ marginTop: 16 }}>
                        Upload Image
                    </Button>
                </label>
                {imageUrl && typeof imageUrl === 'string' && <img src={imageUrl} alt="Uploaded" width="100%" />}
                {imageUrl && typeof imageUrl !== 'string' && <p>{imageUrl.name}</p>}
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
                    <Button variant="raised" component="span" fullWidth style={{ marginTop: 16 }}>
                        Upload Audio File
                    </Button>
                </label>
                {audioFile && <p>{audioFile.name}</p>}

                {/* Audio Preview */}
                {audioFile ? (
                    <audio controls style={{ marginTop: 8 }}>
                        <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                ) : meditation.audioUrl ? (
                    <audio controls style={{ marginTop: 8 }}>
                        <source src={meditation.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    Save Meditation
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditMeditationDialog;
