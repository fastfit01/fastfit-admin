import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Chip, CircularProgress } from '@mui/material';
import ErrorAlert from '../../ErrorAlert';
import { handleGifUpload as uploadGif } from '../../../firebase/programsService';

const WorkoutSection = ({ workout = [], program, weekIndex, dayIndex, ...props }) => {
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState({});

    const handleFileUpload = async (setIndex, exerciseIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setUploading({ [`${setIndex}-${exerciseIndex}`]: true });
                const downloadUrl = await uploadGif(
                    program.id,
                    program.programCategory,
                    program.level,
                    weekIndex,
                    dayIndex,
                    'workout',
                    setIndex,
                    exerciseIndex,
                    file
                );
                
                props.onExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'gifUrl', downloadUrl);
            } catch (error) {
                setError(`Failed to upload GIF: ${error.message}`);
            } finally {
                setUploading({ [`${setIndex}-${exerciseIndex}`]: false });
            }
        }
    };

    return (
        <Box mt={2}>
            <Typography variant="subtitle1">Workout</Typography>
            <Button onClick={() => props.onAddSet(weekIndex, dayIndex)}>Add Set</Button>
            {Array.isArray(workout) && workout.map((set, setIndex) => (
                <Box key={setIndex} mt={1} sx={{
                    border: '1px solid',
                    borderRadius: '10px',
                    padding: '10px'
                }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Chip
                            label={set?.setName || `Set ${setIndex + 1}`}
                            onDelete={() => props.onDeleteSet(weekIndex, dayIndex, setIndex)}
                            color="primary"
                            variant="outlined"
                        />
                        <Button onClick={() => props.onAddExercise(weekIndex, dayIndex, 'workout', setIndex)}>
                            Add Exercise
                        </Button>
                    </Box>
                    {Array.isArray(set?.exercises) && set.exercises.map((exercise, exerciseIndex) => (
                        <Box key={exerciseIndex} mt={1} sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            alignItems: 'center'
                        }}>
                            <TextField
                                label="Exercise Name"
                                value={exercise?.name || ''}
                                onChange={(e) => props.onExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'name', e.target.value)}
                            />
                            <TextField
                                label="Reps"
                                value={exercise?.reps || ''}
                                onChange={(e) => props.onExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'reps', e.target.value)}
                            />
                            <TextField
                                label="Rest"
                                value={exercise?.rest || ''}
                                onChange={(e) => props.onExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'rest', e.target.value)}
                            />
                            <TextField
                                label="Tempo"
                                value={exercise?.tempo || ''}
                                onChange={(e) => props.onExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'tempo', e.target.value)}
                            />
                            <TextField
                                label="Duration"
                                value={exercise?.duration || ''}
                                onChange={(e) => props.onExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'duration', e.target.value)}
                            />
                            <Box display="flex" alignItems="center" gap={1}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id={`gif-upload-workout-${weekIndex}-${dayIndex}-${setIndex}-${exerciseIndex}`}
                                    type="file"
                                    onChange={(e) => handleFileUpload(setIndex, exerciseIndex, e)}
                                />
                                <label htmlFor={`gif-upload-workout-${weekIndex}-${dayIndex}-${setIndex}-${exerciseIndex}`}>
                                    <Button variant="contained" component="span">
                                        {uploading[`${setIndex}-${exerciseIndex}`] ? (
                                            <CircularProgress size={24} />
                                        ) : 'Upload Img /GIF'}
                                    </Button>
                                </label>
                                {exercise.gifUrl && (
                                    <Box mt={1}>
                                        <img
                                            src={exercise.gifUrl}
                                            alt="Exercise Preview"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                onClick={() => props.onDeleteExercise(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex)}
                            >
                                Delete
                            </Button>
                        </Box>
                    ))}
                </Box>
            ))}
            <ErrorAlert error={error} onClose={() => setError(null)} />
        </Box>
    );
};

export default WorkoutSection; 