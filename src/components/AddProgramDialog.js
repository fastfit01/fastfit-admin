import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, Typography, Grid, Checkbox, FormControlLabel } from '@mui/material';
import { addProgram } from '../firebase/programsService';
import { v4 as uuidv4 } from 'uuid';

const AddProgramsDialog = ({ open, onClose }) => {
    const [program, setProgram] = useState({
        id: uuidv4(),
        title: '',
        description: '',
        level: '',
        programImageUrl: null,
        programImageFile: null,
        guidedOrSelfGuidedProgram: '',
        targetArea: [],
        duration: '',
        weeks: [],
        programCategory: ''
    });

    const [currentTarget, setCurrentTarget] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProgram({ ...program, [name]: value });
    };

    const deleteWeek = (weekIndex) => {
        setProgram(prevProgram => {
            const newWeeks = prevProgram.weeks.filter((_, index) => index !== weekIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleTargetAreaChange = () => {
        if (currentTarget && !program.targetArea.includes(currentTarget)) {
            setProgram({ ...program, targetArea: [...program.targetArea, currentTarget] });
            setCurrentTarget('');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setProgram({
            ...program,
            programImageUrl: URL.createObjectURL(file),
            programImageFile: file
        });
    };

    const addWeek = () => {
        setProgram(prevProgram => ({
            ...prevProgram,
            weeks: [...prevProgram.weeks, { days: [] }]
        }));
    };

    const addDay = (weekIndex) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
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
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleDayChange = (weekIndex, dayIndex, field, value) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days[dayIndex][field] = value;
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const addExercise = (weekIndex, dayIndex, type) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days[dayIndex][type].push({
                name: '',
                duration: '',
                gifUrl: null,
                gifFile: null,
                reps: ''
            });
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleExerciseChange = (weekIndex, dayIndex, type, exerciseIndex, field, value) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days[dayIndex][type][exerciseIndex][field] = value;
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleGifUpload = (weekIndex, dayIndex, type, exerciseIndex, e) => {
        const file = e.target.files[0];
        const gifUrl = URL.createObjectURL(file);
        handleExerciseChange(weekIndex, dayIndex, type, exerciseIndex, 'gifUrl', gifUrl);
        handleExerciseChange(weekIndex, dayIndex, type, exerciseIndex, 'gifFile', file);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const programToSubmit = {
    //             ...program,
    //             programImageFile: program.programImageFile,
    //             weeks: program.weeks.map(week => ({
    //                 ...week,
    //                 days: week.days.map(day => ({
    //                     ...day,
    //                     warmUp: day.warmUp.map(exercise => ({
    //                         ...exercise,
    //                         gifFile: exercise.gifFile
    //                     })),
    //                     workout: day.workout.map(exercise => ({
    //                         ...exercise,
    //                         gifFile: exercise.gifFile
    //                     }))
    //                 }))
    //             }))
    //         };

    //         console.log("programToSubmit", programToSubmit);

    //         const newProgram = await addProgram(programToSubmit);
    //         onClose(newProgram);
    //     } catch (error) {
    //         console.error('Error adding program:', error);
    //     }
    // };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const programToSubmit = {
                ...program,
                programImageFile: program.programImageFile,
                weeks: program.weeks.map(week => ({
                    ...week,
                    days: week.days.map(day => ({
                        ...day,
                        warmUp: day.warmUp.map(exercise => ({
                            ...exercise,
                            gifFile: exercise.gifFile
                        })),
                        workout: day.workout.map(exercise => ({
                            ...exercise,
                            gifFile: exercise.gifFile
                        }))
                    }))
                }))
            };

            console.log("programToSubmit", programToSubmit);

            const newProgram = await addProgram(programToSubmit);
            onClose(newProgram);
        } catch (error) {
            console.error('Error adding program:', error);
        }
    };


    const deleteDay = (weekIndex, dayIndex) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days = newWeeks[weekIndex].days.filter((_, index) => index !== dayIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="lg" fullWidth>
            <DialogTitle>Add New Program</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ mt: "-8px" }}>Program category</InputLabel>
                            <Select
                                name="programCategory"
                                value={program.programCategory}
                                onChange={handleChange}
                            >
                                <MenuItem value="atGymWorkouts">At Gym Workouts</MenuItem>
                                <MenuItem value="atHomeWorkouts">At Home Workouts</MenuItem>
                                <MenuItem value="balanceAndStability">Balance and Stability</MenuItem>
                                <MenuItem value="cardioPrograms">Cardio Programs</MenuItem>
                                <MenuItem value="coordinationAndAgilityPrograms">Coordination and Agility Programs</MenuItem>
                                <MenuItem value="kettleBellOnlyPrograms">KettleBell Only Programs</MenuItem>
                                <MenuItem value="yogaPrograms">Yoga Programs</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sx={{ "& .MuiGrid-item": { pt: "25px" } }}>
                        <TextField
                            fullWidth
                            name="title"
                            label="Program Title"
                            value={program.title}
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
                            value={program.description}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ mt: "-8px" }}>Level</InputLabel>
                            <Select
                                name="level"
                                value={program.level}
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
                            value={program.guidedOrSelfGuidedProgram}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            name="duration"
                            label="Duration (e.g., 2 weeks, 4 weeks)"
                            value={program.duration}
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
                            {program.targetArea.map((target, index) => (
                                <Chip
                                    key={index}
                                    label={target}
                                    onDelete={() => {
                                        const newTargets = program.targetArea.filter((_, i) => i !== index);
                                        setProgram({ ...program, targetArea: newTargets });
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
                        {program.programImageUrl && (
                            <img
                                src={program.programImageUrl}
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
                    {program.weeks.map((week, weekIndex) => (
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
                            {week.days.map((day, dayIndex) => (
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
                                    {day.warmUp.map((exercise, exerciseIndex) => (
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
                                                id={`gif-upload-warmup-${weekIndex}-${dayIndex}-${exerciseIndex}`}
                                                type="file"
                                                onChange={(e) => handleGifUpload(weekIndex, dayIndex, 'warmUp', exerciseIndex, e)}
                                            />
                                            <label htmlFor={`gif-upload-warmup-${weekIndex}-${dayIndex}-${exerciseIndex}`}>
                                                <Button variant="contained" component="span">
                                                    Upload GIF
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
                                                        borderRadius: '10%',
                                                        marginTop: 8
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ))}
                                    {/* Workout Exercises */}
                                    <Typography variant="subtitle2" mt={2}>Workout Exercises</Typography>
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
                                                id={`gif-upload-workout-${weekIndex}-${dayIndex}-${exerciseIndex}`}
                                                type="file"
                                                onChange={(e) => handleGifUpload(weekIndex, dayIndex, 'workout', exerciseIndex, e)}
                                            />
                                            <label htmlFor={`gif-upload-workout-${weekIndex}-${dayIndex}-${exerciseIndex}`}>
                                                <Button variant="contained" component="span">
                                                    Upload GIF
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
            {/* <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
            </DialogActions> */}

            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProgramsDialog;
