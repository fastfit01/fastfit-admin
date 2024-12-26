import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { handleGifUpload as uploadGif } from '../../../firebase/programsService';

const WarmUpSection = ({ 
    warmUp, 
    weekIndex, 
    dayIndex, 
    program, 
    onExerciseChange, 
    onAddExercise, 
    onDeleteExercise
}) => {
    const [uploading, setUploading] = useState({});

    const handleAddWarmUp = () => {
        if (onAddExercise) {
            onAddExercise(weekIndex, dayIndex, 'warmUp');
        }
    };

    const handleFileUpload = async (exerciseIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setUploading({ [exerciseIndex]: true });
                const downloadUrl = await uploadGif(
                    program.id,
                    program.programCategory,
                    program.level,
                    weekIndex,
                    dayIndex,
                    'warmUp',
                    null,
                    exerciseIndex,
                    file
                );
                
                onExerciseChange(weekIndex, dayIndex, 'warmUp', null, exerciseIndex, 'gifUrl', downloadUrl);
            } catch (error) {
                console.error("Error uploading GIF:", error);
            } finally {
                setUploading({ [exerciseIndex]: false });
            }
        }
    };


    return (
        <Box mt={2}>
            <Typography variant="subtitle1">Warm Up</Typography>
            <Button onClick={handleAddWarmUp}>Add Warm Up Exercise</Button>
            {warmUp?.map((exercise, index) => (
                <Box key={index} mt={1} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <TextField
                        label="Exercise Name"
                        value={exercise.name || ''}
                        onChange={(e) => onExerciseChange(weekIndex, dayIndex, 'warmUp', null, index, 'name', e.target.value)}
                    />
                    <TextField
                        label="Duration"
                        value={exercise.duration || ''}
                        onChange={(e) => onExerciseChange(weekIndex, dayIndex, 'warmUp', null, index, 'duration', e.target.value)}
                    />
                    <TextField
                        label="Reps"
                        value={exercise.reps || ''}
                        onChange={(e) => onExerciseChange(weekIndex, dayIndex, 'warmUp', null, index, 'reps', e.target.value)}
                    />
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`warm-up-gif-${weekIndex}-${dayIndex}-${index}`}
                        type="file"
                        onChange={(e) => handleFileUpload(index, e)}
                    />
                    <label htmlFor={`warm-up-gif-${weekIndex}-${dayIndex}-${index}`}>
                        <Button component="span">
                            {uploading[index] ? 'Uploading...' : 'Upload Img / GIF'}
                        </Button>
                    </label>
                    {exercise.gifUrl && (
                        <img
                            src={exercise.gifUrl}
                            alt="GIF Preview"
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
                        onClick={() => onDeleteExercise(weekIndex, dayIndex, 'warmUp', null, index)}
                    >
                        Delete
                    </Button>
                </Box>
            ))}
        </Box>
    );
};

export default WarmUpSection; 