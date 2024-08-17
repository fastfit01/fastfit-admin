import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, Typography, Grid, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import { getPrograms, updateProgram } from '../firebase/programsService';
import { v4 as uuidv4 } from 'uuid';

const EditProgramsDialog = ({ open, onClose, program }) => {
    const [editedProgram, setEditedProgram] = useState({
        id: uuidv4(),
        title: '',
        description: '',
        level: '',
        programImageUrl: null,
        programImageFile: null,
        guidedOrSelfGuidedProgram: '',
        targetArea: [],
        duration: '',
        weeks: []
    });
    const [currentTarget, setCurrentTarget] = useState('');
    const [programImageFile, setProgramImageFile] = useState(null);

    useEffect(() => {
        if (program) {
            const weeksArray = program?.weeks ? program.weeks.map(weekKey => ({
                ...program.weeks[weekKey],
                days: program?.weeks[weekKey]?.days ? program?.weeks[weekKey]?.days.map(dayKey => program.weeks[weekKey].days[dayKey]) : []
            })) : [];

            setEditedProgram({
                ...program,
                weeks: weeksArray,
                programImageUrl: program.programImageUrl || ''
            });
        }
    }, [program]);

    if (!editedProgram) return null;

    const deleteWeek = (weekIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = prevProgram.weeks.filter((_, index) => index !== weekIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProgram({ ...editedProgram, [name]: value });
    };

    const handleTargetAreaChange = () => {
        if (currentTarget && !Array.isArray(editedProgram?.targetArea)) {
            setEditedProgram({ ...editedProgram, targetArea: [currentTarget] });
        } else if (currentTarget && !editedProgram?.targetArea?.includes(currentTarget)) {
            setEditedProgram({ ...editedProgram, targetArea: [...editedProgram.targetArea, currentTarget] });
            setCurrentTarget('');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProgramImageFile(file);
            // Create a temporary URL for preview
            const previewUrl = URL.createObjectURL(file);
            setEditedProgram({ ...editedProgram, programImageUrl: previewUrl });
        }
    };

    const addWeek = () => {
        setEditedProgram({
            ...editedProgram,
            weeks: [...editedProgram.weeks, { days: [] }]
        });
    };

    const addDay = (weekIndex) => {
        const newWeeks = [...editedProgram.weeks];
        newWeeks[weekIndex].days.push({
            title: '',
            description: '',
            duration: '',
            targetArea: [],
            isOptional: false,
            imageUrl: '',
            level: '',
            equipment: [],
            warmUp: [],
            workout: []
        });
        setEditedProgram({ ...editedProgram, weeks: newWeeks });
    };

    const handleDayChange = (weekIndex, dayIndex, field, value) => {
        const newWeeks = [...editedProgram.weeks];
        newWeeks[weekIndex].days[dayIndex][field] = value;
        setEditedProgram({ ...editedProgram, weeks: newWeeks });
    };

    const addExercise = (weekIndex, dayIndex, type) => {
        const newWeeks = [...editedProgram.weeks];
        newWeeks[weekIndex].days[dayIndex][type].push({
            name: '',
            duration: '',
            gifUrl: null,
            reps: ''
        });
        setEditedProgram({ ...editedProgram, weeks: newWeeks });
    };

    const handleExerciseChange = (weekIndex, dayIndex, type, exerciseIndex, field, value) => {
        const newWeeks = [...editedProgram.weeks];
        newWeeks[weekIndex].days[dayIndex][type][exerciseIndex][field] = value;
        setEditedProgram({ ...editedProgram, weeks: newWeeks });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const programToUpdate = { ...editedProgram };
            if (programImageFile) {
                programToUpdate.programImageFile = programImageFile;
            }
            const updatedProgram = await updateProgram(editedProgram.id, programToUpdate);
            onClose(updatedProgram);
        } catch (error) {
            console.error('Error updating program:', error);
        }
    };

    const deleteDay = (weekIndex, dayIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days = newWeeks[weekIndex].days.filter((_, index) => index !== dayIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="lg" fullWidth>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="title"
                            label="Program Title"
                            value={editedProgram.title}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            name="description"
                            label="Program Description"
                            value={editedProgram.description}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Level</InputLabel>
                            <Select
                                name="level"
                                value={editedProgram.level}
                                onChange={handleChange}
                            >
                                <MenuItem value="beginner">Beginner</MenuItem>
                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                <MenuItem value="advanced">Advanced</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            name="guidedOrSelfGuidedProgram"
                            label="Guided or Self-Guided Program"
                            value={editedProgram.guidedOrSelfGuidedProgram}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            name="duration"
                            label="Duration (e.g., 2 weeks, 4 weeks)"
                            value={editedProgram.duration}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                            <TextField
                                fullWidth
                                label="Target Area"
                                value={currentTarget}
                                onChange={(e) => setCurrentTarget(e.target.value)}
                            />
                            <Button onClick={handleTargetAreaChange}>Add</Button>
                        </Box>
                        <Box mt={1}>
                            {editedProgram?.targetArea?.map((target, index) => (
                                <Chip
                                    key={index}
                                    label={target}
                                    onDelete={() => {
                                        const newTargets = editedProgram.targetArea.filter((_, i) => i !== index);
                                        setEditedProgram({ ...editedProgram, targetArea: newTargets });
                                    }}
                                    style={{ margin: 4 }}
                                />
                            ))}
                        </Box>
                    </Grid>


                    <Grid item xs={12}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="image-upload"
                            type="file"
                            onChange={handleImageUpload}
                        />
                        <label htmlFor="image-upload">
                            <Button variant="contained" component="span" fullWidth style={{ marginTop: 16 }}>
                                Upload Image
                            </Button>
                        </label>
                        {editedProgram.programImageUrl && (
                            <img
                                src={editedProgram.programImageUrl}
                                alt="Uploaded"
                                style={{
                                    width: 'auto',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '10%',
                                    marginTop: 16
                                }}
                            />
                        )}
                    </Grid>
                </Grid>

                <Box mt={4}>
                    <Button onClick={addWeek}>Add Week</Button>
                    {editedProgram?.weeks?.map((week, weekIndex) => (
                        <Box key={weekIndex} mt={2}>
                            <Box display="flex" alignItems="center">
                                <Chip
                                    key={weekIndex}
                                    label={`Week ${weekIndex + 1}`}
                                    onDelete={() => deleteWeek(weekIndex)}
                                    color="primary"
                                    variant="outlined"
                                    style={{
                                        margin: '4px',
                                        height: '50px',
                                        width: '100px'
                                    }}
                                />
                            </Box>
                            <Button onClick={() => addDay(weekIndex)}>Add Day</Button>

                            {week?.days?.map((day, dayIndex) => (
                                <Box key={dayIndex} mt={2} border={1} borderColor="grey.300" p={2} sx={{
                                    "& .MuiTextField-root": { margin: '6px' }
                                }}>

                                    <Chip
                                        key={dayIndex}
                                        label={`Day ${dayIndex + 1}: ${day.title}`}
                                        onDelete={() => deleteDay(weekIndex, dayIndex)}
                                        color="primary"
                                        variant="outlined"
                                        style={{
                                            margin: '4px',
                                            height: '50px',
                                            width: '100px'
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Day Title"
                                        value={day.title}
                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'title', e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Day Description"
                                        value={day.description}
                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'description', e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Duration (in minutes)"
                                        type="number"
                                        value={day.duration}
                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'duration', e.target.value)}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={day.isOptional}
                                                onChange={(e) => handleDayChange(weekIndex, dayIndex, 'isOptional', e.target.checked)}
                                            />
                                        }
                                        label="Optional Day"
                                    />

                                    {/* Warm-up Exercises */}
                                    <Typography variant="subtitle2">Warm-up Exercises</Typography>
                                    <Button onClick={() => addExercise(weekIndex, dayIndex, 'warmUp')}>Add Warm-up Exercise</Button>
                                    {day?.warmUp?.map((exercise, exerciseIndex) => (
                                        <Box key={exerciseIndex} mt={1} sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <TextField
                                                label="Exercise Name"
                                                value={exercise.name}
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', exerciseIndex, 'name', e.target.value)}
                                            />
                                            <TextField
                                                label="Duration"
                                                value={exercise.duration}
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', exerciseIndex, 'duration', e.target.value)}
                                            />
                                            <TextField
                                                label="Reps"
                                                value={exercise.reps}
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', exerciseIndex, 'reps', e.target.value)}
                                            />
                                            <input
                                                accept="image/gif"
                                                style={{ display: 'none' }}
                                                id={`warm-up-gif-${weekIndex}-${dayIndex}-${exerciseIndex}`}
                                                type="file"
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', exerciseIndex, 'gifUrl', e.target.files[0])}
                                            />
                                            <label htmlFor={`warm-up-gif-${weekIndex}-${dayIndex}-${exerciseIndex}`}>
                                                <Button component="span">Upload GIF</Button>
                                            </label>
                                            {exercise.gifUrl && (
                                                <img
                                                    src={exercise.gifUrl}
                                                    alt="GIF Preview"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10%',
                                                        marginTop: 8
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ))}

                                    {/* Workout Exercises */}
                                    <Typography variant="subtitle2">Workout Exercises</Typography>
                                    <Button onClick={() => addExercise(weekIndex, dayIndex, 'workout')}>Add Workout Exercise</Button>
                                    {day?.workout?.map((exercise, exerciseIndex) => (
                                        <Box key={exerciseIndex} mt={1} sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <TextField
                                                label="Exercise Name"
                                                value={exercise.name}
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', exerciseIndex, 'name', e.target.value)}
                                            />
                                            <TextField
                                                label="Duration"
                                                value={exercise.duration}
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', exerciseIndex, 'duration', e.target.value)}
                                            />
                                            <TextField
                                                label="Reps"
                                                value={exercise.reps}
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', exerciseIndex, 'reps', e.target.value)}
                                            />
                                            <input
                                                accept="image/gif"
                                                style={{ display: 'none' }}
                                                id={`workout-gif-${weekIndex}-${dayIndex}-${exerciseIndex}`}
                                                type="file"
                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', exerciseIndex, 'gifUrl', e.target.files[0])}
                                            />
                                            <label htmlFor={`workout-gif-${weekIndex}-${dayIndex}-${exerciseIndex}`}>
                                                <Button component="span">Upload GIF</Button>
                                            </label>

                                            {exercise.gifUrl && (
                                                <img
                                                    src={exercise.gifUrl}
                                                    alt="GIF Preview"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10%',
                                                        marginTop: 8
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProgramsDialog;