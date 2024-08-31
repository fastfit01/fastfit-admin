import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, Typography, Grid, Checkbox, FormControlLabel, IconButton, CircularProgress } from '@mui/material';
import { updateProgram } from '../firebase/programsService';
import DeleteIcon from '@mui/icons-material/Delete';

const EditProgramsDialog = ({ open, onClose, program }) => {
    const [editedProgram, setEditedProgram] = useState(() => ({
        id: program?.id ?? '',
        title: program?.title ?? '',
        description: program?.description ?? '',
        level: program?.level ?? '',
        programCategory: program?.programCategory ?? '',
        programImageUrl: program?.programImageUrl ?? null,
        programImageFile: null,
        duration: program?.duration ?? '',
        guidedOrSelfGuidedProgram: program?.guidedOrSelfGuidedProgram ?? '',
        weeks: program?.weeks?.map(week => ({
            days: week.days?.map(day => ({
                title: day?.title ?? '',
                description: day?.description ?? '',
                duration: day?.duration ?? '',
                targetArea: day?.targetArea ?? [],
                isOptional: day?.isOptional ?? false,
                focus: day?.focus ?? '',
                warmUp: day?.warmUp ?? [],
                workout: day?.workout ?? [],
                mindfulness: day?.mindfulness ?? [],
                stretch: day?.stretch ?? [],
                imageUrl: day?.imageUrl ?? null
            })) ?? []
        })) ?? []
    }));
    const [oldProgram, setOldProgram] = useState(program);
    const [currentTarget, setCurrentTarget] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setEditedProgram({
            id: program?.id ?? '',
            title: program?.title ?? '',
            description: program?.description ?? '',
            level: program?.level ?? '',
            programCategory: program?.programCategory ?? '',
            programImageUrl: program?.programImageUrl ?? null,
            programImageFile: null,
            duration: program?.duration ?? '',
            guidedOrSelfGuidedProgram: program?.guidedOrSelfGuidedProgram ?? '',
            weeks: program?.weeks?.map(week => ({
                days: week.days?.map(day => ({
                    title: day?.title ?? '',
                    description: day?.description ?? '',
                    duration: day?.duration ?? '',
                    targetArea: day?.targetArea ?? [],
                    isOptional: day?.isOptional ?? false,
                    focus: day?.focus ?? '',
                    warmUp: day?.warmUp ?? [],
                    workout: day?.workout ?? [],
                    mindfulness: day?.mindfulness ?? [],
                    stretch: day?.stretch ?? [],
                    imageUrl: day?.imageUrl
                })) ?? []
            })) ?? []
        });
        setOldProgram(program);
    }, [program]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProgram({ ...editedProgram, [name]: value });
    };

    useEffect(() => {
        console.log("editedProgram", editedProgram);
    }, [editedProgram]);

    const addWeek = () => {
        setEditedProgram({
            ...editedProgram,
            weeks: [...editedProgram?.weeks, { days: [] }]
        });
    };

    const deleteWeek = (weekIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = prevProgram?.weeks?.filter((_, index) => index !== weekIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const addDay = (weekIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram?.weeks];
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

    const deleteDay = (weekIndex, dayIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram?.weeks];
            newWeeks[weekIndex].days = newWeeks[weekIndex].days.filter((_, index) => index !== dayIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const addSet = (weekIndex, dayIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram?.weeks];
            if (!newWeeks[weekIndex].days[dayIndex].workout) {
                newWeeks[weekIndex].days[dayIndex].workout = [];
            }
            newWeeks[weekIndex].days[dayIndex].workout.push({
                setName: `Set ${newWeeks[weekIndex].days[dayIndex].workout.length + 1}`,
                exercises: []
            });
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleDayChange = (weekIndex, dayIndex, field, value) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram?.weeks];
            newWeeks[weekIndex].days[dayIndex][field] = value;
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleTargetAreaChange = (weekIndex, dayIndex) => {
        if (currentTarget) {
            const newTargetArea = [...editedProgram?.weeks[weekIndex]?.days[dayIndex]?.targetArea, currentTarget];
            handleDayChange(weekIndex, dayIndex, 'targetArea', newTargetArea);
            setCurrentTarget('');
        }
    };

    const removeTargetArea = (weekIndex, dayIndex, targetIndex) => {
        const newTargetArea = editedProgram?.weeks[weekIndex]?.days[dayIndex]?.targetArea?.filter((_, index) => index !== targetIndex);
        handleDayChange(weekIndex, dayIndex, 'targetArea', newTargetArea);
    };

    const addExercise = (weekIndex, dayIndex, type, setIndex = null) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram?.weeks];
            if (type === 'warmUp') {
                if (!newWeeks[weekIndex]?.days[dayIndex]?.warmUp) {
                    newWeeks[weekIndex].days[dayIndex].warmUp = [];
                }
                newWeeks[weekIndex].days[dayIndex].warmUp.push({
                    name: '',
                    duration: '',
                    reps: '',
                    gifUrl: null,
                    gifFile: null
                });
            } else if (type === 'workout') {
                if (!newWeeks[weekIndex].days[dayIndex].workout) {
                    newWeeks[weekIndex].days[dayIndex].workout = [];
                }
                if (!newWeeks[weekIndex].days[dayIndex].workout[setIndex]) {
                    newWeeks[weekIndex].days[dayIndex].workout[setIndex] = {
                        setName: `Set ${setIndex + 1}`,
                        exercises: []
                    };
                }
                newWeeks[weekIndex].days[dayIndex].workout[setIndex].exercises.push({
                    name: '',
                    reps: '',
                    rest: '',
                    tempo: '',
                    gifUrl: null,
                    gifFile: null
                });
            }
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleAddExercise = (weekIndex, dayIndex, type) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            if (!newWeeks[weekIndex].days[dayIndex][type]) {
                newWeeks[weekIndex].days[dayIndex][type] = [];
            }
            newWeeks[weekIndex].days[dayIndex][type].push({
                name: '',
                duration: '',
                imageUrl: null,
                imageFile: null
            });
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleExerciseChange = (weekIndex, dayIndex, type, setIndex, exerciseIndex, field, value) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            if (type === 'warmUp' || type === 'mindfulness' || type === 'stretch') {
                newWeeks[weekIndex].days[dayIndex][type][exerciseIndex][field] = value;
            } else if (type === 'workout') {
                newWeeks[weekIndex].days[dayIndex].workout[setIndex].exercises[exerciseIndex][field] = value;
            }
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleGifUpload = (weekIndex, dayIndex, type, setIndex, exerciseIndex, e) => {
        const file = e.target.files[0];
        const gifUrl = URL.createObjectURL(file);
        if (type === 'warmUp') {
            handleExerciseChange(weekIndex, dayIndex, type, null, exerciseIndex, 'gifUrl', gifUrl);
            handleExerciseChange(weekIndex, dayIndex, type, null, exerciseIndex, 'gifFile', file);
        } else if (type === 'workout') {
            handleExerciseChange(weekIndex, dayIndex, type, setIndex, exerciseIndex, 'gifUrl', gifUrl);
            handleExerciseChange(weekIndex, dayIndex, type, setIndex, exerciseIndex, 'gifFile', file);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditedProgram({
                ...editedProgram,
                programImageFile: file,
                programImageUrl: URL.createObjectURL(file)
            });
        }
    };

    const handleWeeksImageUpload = (weekIndex, dayIndex, type, exerciseIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            handleExerciseChange(weekIndex, dayIndex, type, null, exerciseIndex, 'imageUrl', imageUrl);
            handleExerciseChange(weekIndex, dayIndex, type, null, exerciseIndex, 'imageFile', file);
        }
    };

    const handleDayImageUpload = (weekIndex, dayIndex, event) => {
        const file = event.target.files[0];
        if (file) {
            const newProgram = { ...editedProgram };
            newProgram.weeks[weekIndex].days[dayIndex].imageFile = file;
            newProgram.weeks[weekIndex].days[dayIndex].imageUrl = URL.createObjectURL(file);
            setEditedProgram(newProgram);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updatedProgram = await updateProgram(oldProgram.id, editedProgram, oldProgram.programCategory, oldProgram.level);
            console.log("Updated program received:", updatedProgram);
            onClose(updatedProgram);
        } catch (error) {
            console.error('Error updating program:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{ height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="lg" fullWidth>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ "& .MuiGrid-item": { pt: "25px" } }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ mt: "-8px" }}>Program category</InputLabel>
                            <Select
                                name="programCategory"
                                value={editedProgram.programCategory}
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel sx={{ mt: "-8px" }}>Level</InputLabel>
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
                    <Grid item xs={6} sx={{ mt: "15px" }}>
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
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6">Day {dayIndex + 1}</Typography>
                                        <IconButton onClick={() => deleteDay(weekIndex, dayIndex)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>

                                    <Grid item>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} container spacing={2}>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Day Title"
                                                        value={day.title}
                                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'title', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Day Description"
                                                        value={day.description}
                                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'description', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Duration"
                                                        value={day.duration}
                                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'duration', e.target.value)}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12} container spacing={2} alignItems="center">
                                                <Grid item xs={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Target Area"
                                                        value={currentTarget}
                                                        onChange={(e) => setCurrentTarget(e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        onClick={() => handleTargetAreaChange(weekIndex, dayIndex)}
                                                    >
                                                        Add Target Area
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    {day.targetArea?.map((target, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={target}
                                                            onDelete={() => removeTargetArea(weekIndex, dayIndex, index)}
                                                            style={{ margin: 4 }}
                                                        />
                                                    ))}
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={day.isOptional}
                                                                onChange={(e) => handleDayChange(weekIndex, dayIndex, 'isOptional', e.target.checked)}
                                                            />
                                                        }
                                                        label="Optional"
                                                    />
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <TextField
                                                        fullWidth
                                                        label="Focus"
                                                        value={day.focus}
                                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'focus', e.target.value)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={4} sx={{
                                            display: 'flex',
                                            marginTop: '10px',
                                            alignItems: 'center'
                                        }}>
                                            <input
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                id={`day-image-upload-${weekIndex}-${dayIndex}`}
                                                type="file"
                                                onChange={(e) => handleDayImageUpload(weekIndex, dayIndex, e)}
                                            />
                                            <label htmlFor={`day-image-upload-${weekIndex}-${dayIndex}`}>
                                                <Button variant="contained" component="span">
                                                    Upload Day Image
                                                </Button>
                                            </label>
                                            {day.imageUrl && (
                                                <img
                                                    src={day.imageUrl}
                                                    alt="Day Image Preview"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10%',
                                                        marginLeft: '10px'
                                                    }}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>

                                    <Box mt={2}>
                                        <Typography variant="subtitle1">Warm Up</Typography>
                                        <Button onClick={() => addExercise(weekIndex, dayIndex, 'warmUp')}>Add Warm Up Exercise</Button>
                                        {day.warmUp?.map((exercise, index) => (
                                            <Box key={index} mt={1}>
                                                <TextField
                                                    label="Exercise Name"
                                                    value={exercise.name}
                                                    onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', null, index, 'name', e.target.value)}
                                                />
                                                <TextField
                                                    label="Duration"
                                                    value={exercise.duration}
                                                    onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', null, index, 'duration', e.target.value)}
                                                />
                                                <TextField
                                                    label="Reps"
                                                    value={exercise.reps}
                                                    onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', null, index, 'reps', e.target.value)}
                                                />
                                                <input
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    id={`warm-up-gif-${weekIndex}-${dayIndex}-${index}`}
                                                    type="file"
                                                    onChange={(e) => handleGifUpload(weekIndex, dayIndex, 'warmUp', null, index, e)}
                                                />
                                                <label htmlFor={`warm-up-gif-${weekIndex}-${dayIndex}-${index}`}>
                                                    <Button component="span">Upload Img / GIF</Button>
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
                                    <Box mt={2}>
                                        <Typography variant="subtitle1">Workout</Typography>
                                        <Button onClick={() => addSet(weekIndex, dayIndex)}>Add Set</Button>
                                        {day.workout?.map((set, setIndex) => (
                                            <Box key={setIndex} mt={1}>
                                                <Typography variant="subtitle2">{set.setName}</Typography>
                                                <Button onClick={() => addExercise(weekIndex, dayIndex, 'workout', setIndex)}>Add Exercise</Button>
                                                {set.exercises?.map((exercise, exerciseIndex) => (
                                                    <Box key={exerciseIndex} mt={1}>
                                                        <TextField
                                                            label="Exercise Name"
                                                            value={exercise.name}
                                                            onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'name', e.target.value)}
                                                        />
                                                        <TextField
                                                            label="Reps"
                                                            value={exercise.reps}
                                                            onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'reps', e.target.value)}
                                                        />
                                                        <TextField
                                                            label="Rest"
                                                            value={exercise.rest}
                                                            onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'rest', e.target.value)}
                                                        />
                                                        <TextField
                                                            label="Tempo"
                                                            value={exercise.tempo}
                                                            onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'tempo', e.target.value)}
                                                        />
                                                        <input
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            id={`workout-gif-${weekIndex}-${dayIndex}-${setIndex}-${exerciseIndex}`}
                                                            type="file"
                                                            onChange={(e) => handleGifUpload(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, e)}
                                                        />
                                                        <label htmlFor={`workout-gif-${weekIndex}-${dayIndex}-${setIndex}-${exerciseIndex}`}>
                                                            <Button component="span">Upload Image / GIF</Button>
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
                                    <Box mt={2}>
                                        <Typography variant="subtitle1">Mindfulness</Typography>
                                        <Button onClick={() => handleAddExercise(weekIndex, dayIndex, 'mindfulness')}>Add Mindfulness Exercise</Button>
                                        {day.mindfulness?.map((exercise, index) => (
                                            <Box key={index} mt={1}>
                                                <TextField
                                                    label="Exercise Name"
                                                    value={exercise.name}
                                                    onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'mindfulness', null, index, 'name', e.target.value)}
                                                />
                                                <TextField
                                                    label="Duration"
                                                    value={exercise.duration}
                                                    onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'mindfulness', null, index, 'duration', e.target.value)}
                                                />
                                                <input
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    id={`mindfulness-image-${weekIndex}-${dayIndex}-${index}`}
                                                    type="file"
                                                    onChange={(e) => handleWeeksImageUpload(weekIndex, dayIndex, 'mindfulness', index, e)}
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
                                                            borderRadius: '10%',
                                                            marginTop: 8
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box mt={2}>
                                        <Typography variant="subtitle1">Stretch</Typography>
                                        <Button onClick={() => handleAddExercise(weekIndex, dayIndex, 'stretch')}>Add Stretch Exercise</Button>
                                        {day.stretch?.map((exercise, index) => (
                                            <Box key={index} mt={1}>
                                                <TextField
                                                    label="Exercise Name"
                                                    value={exercise.name}
                                                    onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'stretch', null, index, 'name', e.target.value)}
                                                />
                                                <TextField
                                                    label="Duration"
                                                    value={exercise.duration}
                                                    onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'stretch', null, index, 'duration', e.target.value)}
                                                />
                                                <input
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    id={`stretch-image-${weekIndex}-${dayIndex}-${index}`}
                                                    type="file"
                                                    onChange={(e) => handleWeeksImageUpload(weekIndex, dayIndex, 'stretch', index, e)}
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
                                                            borderRadius: '10%',
                                                            marginTop: 8
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
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