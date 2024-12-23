import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { handleMindfulnessImageUpload } from '../../../firebase/programsService';

const MindfulnessSection = ({ 
    mindfulness, 
    weekIndex, 
    dayIndex, 
    program, 
    onExerciseChange, 
    onAddExercise, 
    onDeleteExercise,
    onImageUpload 
}) => {
    const handleAddMindfulness = () => {
        if (onAddExercise) {
            onAddExercise(weekIndex, dayIndex, 'mindfulness');
        }
    };

    const handleImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const downloadUrl = await handleMindfulnessImageUpload(
                    program.id,
                    program.programCategory,
                    program.level,
                    weekIndex,
                    dayIndex,
                    index,
                    file
                );
                
                onExerciseChange(weekIndex, dayIndex, 'mindfulness', null, index, 'imageUrl', downloadUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    return (
        <Box mt={2}>
            <Typography variant="subtitle1">Mindfulness</Typography>
            <Button onClick={handleAddMindfulness}>Add Mindfulness Exercise</Button>
            {mindfulness?.map((exercise, index) => (
                <Box key={index} mt={1} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <TextField
                        label="Exercise Name"
                        value={exercise.name}
                        onChange={(e) => onExerciseChange(weekIndex, dayIndex, 'mindfulness', null, index, 'name', e.target.value)}
                    />
                    <TextField
                        label="Duration"
                        value={exercise.duration}
                        onChange={(e) => onExerciseChange(weekIndex, dayIndex, 'mindfulness', null, index, 'duration', e.target.value)}
                    />
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`mindfulness-image-${weekIndex}-${dayIndex}-${index}`}
                        type="file"
                        onChange={(e) => handleImageUpload(index, e)}
                    />
                    <label htmlFor={`mindfulness-image-${weekIndex}-${dayIndex}-${index}`}>
                        <Button component="span">Upload Image</Button>
                    </label>
                    {exercise.imageUrl && (
                        <img
                            src={exercise.imageUrl}
                            alt="Image Preview"
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '10%'
                            }}
                        />
                    )}
                    <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => onDeleteExercise(weekIndex, dayIndex, 'mindfulness', null, index)}
                    >
                        Delete
                    </Button>
                </Box>
            ))}
        </Box>
    );
};

export default MindfulnessSection; 