import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { handleStretchImageUpload } from '../../../firebase/programsService';

const StretchSection = ({ 
    stretch, 
    weekIndex, 
    dayIndex, 
    program, 
    onExerciseChange, 
    onAddExercise, 
    onDeleteExercise,
    onImageUpload 
}) => {
    const handleAddStretch = () => {
        if (onAddExercise) {
            onAddExercise(weekIndex, dayIndex, 'stretch');
        }
    };

    const handleImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const downloadUrl = await handleStretchImageUpload(
                    program.id,
                    program.programCategory,
                    program.level,
                    weekIndex,
                    dayIndex,
                    index,
                    file
                );
                
                onExerciseChange(weekIndex, dayIndex, 'stretch', null, index, 'imageUrl', downloadUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    };

    return (
        <Box mt={2}>
            <Typography variant="subtitle1">Stretch</Typography>
            <Button onClick={handleAddStretch}>Add Stretch Exercise</Button>
            {stretch?.map((exercise, index) => (
                <Box key={index} mt={1} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <TextField
                        label="Exercise Name"
                        value={exercise.name}
                        onChange={(e) => onExerciseChange(weekIndex, dayIndex, 'stretch', null, index, 'name', e.target.value)}
                    />
                    <TextField
                        label="Duration"
                        value={exercise.duration}
                        onChange={(e) => onExerciseChange(weekIndex, dayIndex, 'stretch', null, index, 'duration', e.target.value)}
                    />
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`stretch-image-${weekIndex}-${dayIndex}-${index}`}
                        type="file"
                        onChange={(e) => handleImageUpload(index, e)}
                    />
                    <label htmlFor={`stretch-image-${weekIndex}-${dayIndex}-${index}`}>
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
                        onClick={() => onDeleteExercise(weekIndex, dayIndex, 'stretch', null, index)}
                    >
                        Delete
                    </Button>
                </Box>
            ))}
        </Box>
    );
};

export default StretchSection; 