import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, Typography, Grid, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
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
        duration: '',
        weeks: [],
        programCategory: ''
    });

    const [currentTarget, setCurrentTarget] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProgram({ ...program, [name]: value });
    };

    useEffect(() => {
        console.log("program=>", program);
    }, [program]);

    const deleteWeek = (weekIndex) => {
        setProgram(prevProgram => {
            const newWeeks = prevProgram.weeks.filter((_, index) => index !== weekIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleTargetAreaChange = (weekIndex, dayIndex) => {
        if (currentTarget && !program.weeks[weekIndex].days[dayIndex].targetArea.includes(currentTarget)) {
            handleDayChange(weekIndex, dayIndex, 'targetArea', [...program.weeks[weekIndex].days[dayIndex].targetArea, currentTarget]);
            setCurrentTarget('');
        }
    };

    const deleteSet = (weekIndex, dayIndex, setIndex) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            const newDays = [...newWeeks[weekIndex].days];
            newDays[dayIndex].workout = newDays[dayIndex].workout.filter((_, index) => index !== setIndex);
            newWeeks[weekIndex].days = newDays;
            return { ...prevProgram, weeks: newWeeks };
        });
    };
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProgram({
                ...program,
                programImageUrl: URL.createObjectURL(file),
                programImageFile: file
            });
        }
    };

    const handleWeeksImageUpload = (weekIndex, dayIndex, type, exerciseIndex, e) => {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        handleExerciseChange(weekIndex, dayIndex, type, null, exerciseIndex, 'imageUrl', imageUrl);
        handleExerciseChange(weekIndex, dayIndex, type, null, exerciseIndex, 'imageFile', file);
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

    const addSet = (weekIndex, dayIndex) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
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
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days[dayIndex][field] = value;
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const addExercise = (weekIndex, dayIndex, type, setIndex = null) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            if (type === 'warmUp') {
                if (!newWeeks[weekIndex].days[dayIndex].warmUp) {
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
                    duration: '',
                    gifUrl: null,
                    gifFile: null
                });
            }
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleAddExercise = (weekIndex, dayIndex, type) => {
        setProgram(prevProgram => {
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
        setProgram(prevProgram => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const programToSubmit = {
                ...program,
                programImageFile: program.programImageFile,
                weeks: program.weeks.map(week => ({
                    ...week,
                    days: week.days.map(day => ({
                        ...day,
                        imageFile: day.imageFile,
                        warmUp: day.warmUp.map(exercise => ({
                            ...exercise,
                            gifFile: exercise.gifFile
                        })),
                        workout: day.workout.map(exercise => ({
                            ...exercise,
                            gifFile: exercise.gifFile
                        })),
                        mindfulness: day.mindfulness?.map(exercise => ({
                            ...exercise,
                            imageFile: exercise.imageFile
                        })),
                        stretch: day.stretch?.map(exercise => ({
                            ...exercise,
                            imageFile: exercise.imageFile
                        }))
                    }))
                }))
            }

            console.log("programToSubmit=>", programToSubmit);

            const newProgram = await addProgram(programToSubmit);
            console.log("newProgram=>", newProgram);

            onClose(newProgram);
        } catch (error) {
            console.error('Error adding program:', error);
        } finally {
            setIsLoading(false);
            setProgram("");
        }
    };

    const handleDayImageUpload = (weekIndex, dayIndex, e) => {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days[dayIndex].imageUrl = imageUrl;
            newWeeks[weekIndex].days[dayIndex].imageFile = file;
            return { ...prevProgram, weeks: newWeeks };
        });
    };


    const deleteDay = (weekIndex, dayIndex) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            newWeeks[weekIndex].days = newWeeks[weekIndex].days.filter((_, index) => index !== dayIndex);
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    // Add this new function near other delete functions
    const deleteExercise = (weekIndex, dayIndex, type, setIndex, exerciseIndex) => {
        setProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            if (type === 'workout') {
                newWeeks[weekIndex].days[dayIndex].workout[setIndex].exercises = 
                    newWeeks[weekIndex].days[dayIndex].workout[setIndex].exercises.filter((_, index) => index !== exerciseIndex);
            } else {
                newWeeks[weekIndex].days[dayIndex][type] = 
                    newWeeks[weekIndex].days[dayIndex][type].filter((_, index) => index !== exerciseIndex);
            }
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="lg" fullWidth>
            <DialogTitle>Add New Program</DialogTitle>
            <DialogContent>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid>
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
                            <Grid item xs={6} sx={{ mt: "15px" }}>
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
                            {program?.weeks?.map((week, weekIndex) => (
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
                                                label={`Day ${dayIndex + 1}`}
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
                                                label="Duration"
                                                value={day.duration}
                                                onChange={(e) => handleDayChange(weekIndex, dayIndex, 'duration', e.target.value)}
                                            />

                                            <Grid item xs={12} sx={{
                                                display: 'flex',
                                                marginTop: '10px'
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


                                            <FormControlLabel
                                                style={{ display: "flex" }}
                                                control={
                                                    <Checkbox
                                                        checked={day.isOptional}
                                                        onChange={(e) => handleDayChange(weekIndex, dayIndex, 'isOptional', e.target.checked)}
                                                    />
                                                }
                                                label="Optional Day"
                                            />

                                            <TextField
                                                label="Focus"
                                                value={day?.focus}
                                                onChange={(e) => handleDayChange(weekIndex, dayIndex, 'focus', e.target.value)}
                                            />

                                            {/* Focus Section */}
                                            <TextField
                                                label="Target Area"
                                                value={currentTarget}
                                                onChange={(e) => setCurrentTarget(e.target.value)}
                                            />
                                            <Button onClick={() => handleTargetAreaChange(weekIndex, dayIndex)}>Add</Button>
                                            {day.targetArea?.map((target, index) => (
                                                <Chip
                                                    key={index}
                                                    label={target}
                                                    onDelete={() => {
                                                        const newTargets = day.targetArea.filter((_, i) => i !== index);
                                                        handleDayChange(weekIndex, dayIndex, 'targetArea', newTargets);
                                                    }}
                                                    style={{ margin: 4 }}
                                                />
                                            ))}

                                            {/* mindfulness Section */}
                                            <Typography variant="subtitle2" mt={2}>mindfulness</Typography>
                                            <Button onClick={() => handleAddExercise(weekIndex, dayIndex, 'mindfulness')}>Add mindfulness Exercise</Button>
                                            {day.mindfulness?.map((exercise, index) => (
                                                <Box key={index} mt={1} sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    alignItems: 'center'
                                                }}>
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
                                                        id={`image-upload-mindfulness-${weekIndex}-${dayIndex}-${index}`}
                                                        type="file"
                                                        onChange={(e) => handleWeeksImageUpload(weekIndex, dayIndex, 'mindfulness', index, e)}
                                                    />
                                                    <label htmlFor={`image-upload-mindfulness-${weekIndex}-${dayIndex}-${index}`}>
                                                        <Button variant="contained" component="span">
                                                            Upload Image
                                                        </Button>
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
                                                        onClick={() => deleteExercise(weekIndex, dayIndex, 'mindfulness', null, index)}
                                                    >
                                                        Delete
                                                    </Button>
                                                    
                                                </Box>
                                            ))}

                                            {/* stretch Section */}
                                            <Typography variant="subtitle2" mt={2}>stretch</Typography>
                                            <Button onClick={() => handleAddExercise(weekIndex, dayIndex, 'stretch')}>Add stretch Exercise</Button>
                                            {day.stretch?.map((exercise, index) => (
                                                <Box key={index} mt={1} sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    alignItems: 'center'
                                                }}>
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
                                                        id={`image-upload-stretch-${weekIndex}-${dayIndex}-${index}`}
                                                        type="file"
                                                        onChange={(e) => handleWeeksImageUpload(weekIndex, dayIndex, 'stretch', index, e)}
                                                    />
                                                    <label htmlFor={`image-upload-stretch-${weekIndex}-${dayIndex}-${index}`}>
                                                        <Button variant="contained" component="span">
                                                            Upload Image
                                                        </Button>
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
                                                        onClick={() => deleteExercise(weekIndex, dayIndex, 'stretch', null, index)}
                                                    >
                                                        Delete
                                                    </Button>
                                                   
                                                </Box>
                                            ))}


                                            {/* Warm-up Exercises */}
                                            <Typography variant="subtitle2">Warm-up Exercises</Typography>
                                            <Button onClick={() => addExercise(weekIndex, dayIndex, 'warmUp')}>Add Warm-up Exercise</Button>
                                            {day?.warmUp?.map((exercise, exerciseIndex) => (
                                                <Box key={exerciseIndex} mt={1} sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    alignItems: 'center'
                                                }}>
                                                    <TextField
                                                        label="Exercise Name"
                                                        value={exercise.name}
                                                        onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', null, exerciseIndex, 'name', e.target.value)}
                                                    />
                                                    <TextField
                                                        label="Duration"
                                                        value={exercise.duration}
                                                        onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', null, exerciseIndex, 'duration', e.target.value)}
                                                    />
                                                    <TextField
                                                        label="Reps"
                                                        value={exercise.reps}
                                                        onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'warmUp', null, exerciseIndex, 'reps', e.target.value)}
                                                    />
                                                    <input
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        id={`gif-upload-warmup-${weekIndex}-${dayIndex}-${exerciseIndex}`}
                                                        type="file"
                                                        onChange={(e) => handleGifUpload(weekIndex, dayIndex, 'warmUp', null, exerciseIndex, e)}
                                                    />
                                                    <label htmlFor={`gif-upload-warmup-${weekIndex}-${dayIndex}-${exerciseIndex}`}>
                                                        <Button variant="contained" component="span">
                                                            Upload Img / GIF
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
                                                        onClick={() => deleteExercise(weekIndex, dayIndex, 'warmUp', null, exerciseIndex)}
                                                    >
                                                        Delete
                                                    </Button>
                                                 
                                                </Box>
                                            ))}

                                            {/* Workout Exercises */}
                                            <Typography variant="subtitle2" mt={2}>Workout</Typography>
                                            <Button onClick={() => addSet(weekIndex, dayIndex)}>Add Set</Button>
                                            {day?.workout?.map((set, setIndex) => (
                                                <Box key={setIndex} mt={1} sx={{
                                                    border: '1px solid',
                                                    borderRadius: '10px',
                                                    padding: '10px'
                                                }}>
                                                    <Chip
                                                        key={setIndex}
                                                        label={`Set ${setIndex + 1}`}
                                                        onDelete={() => deleteSet(weekIndex, dayIndex, setIndex)}
                                                        color="primary"
                                                        variant="outlined"
                                                        style={{
                                                            margin: '4px',
                                                            height: '40px',
                                                            width: '80px'
                                                        }}
                                                    />
                                                    <Button onClick={() => addExercise(weekIndex, dayIndex, 'workout', setIndex)}>
                                                        Add Exercise
                                                    </Button>
                                                    {set.exercises.map((exercise, exerciseIndex) => (
                                                        <Box key={exerciseIndex} mt={1} sx={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: 1,
                                                            alignItems: 'center'
                                                        }}>
                                                            <TextField
                                                                label="Exercise Name"
                                                                value={exercise?.name}
                                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'name', e.target.value)}
                                                            />
                                                            <TextField
                                                                label="Reps"
                                                                value={exercise?.reps}
                                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'reps', e.target.value)}
                                                            />
                                                            <TextField
                                                                label="Rest"
                                                                value={exercise?.rest}
                                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'rest', e.target.value)}
                                                            />
                                                            <TextField
                                                                label="Tempo"
                                                                value={exercise?.tempo}
                                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'tempo', e.target.value)}
                                                            />
                                                            <TextField
                                                                label="Duration"
                                                                value={exercise?.duration}
                                                                onChange={(e) => handleExerciseChange(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, 'duration', e.target.value)}
                                                            />
                                                            <input
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                                id={`gif-upload-workout-${weekIndex}-${dayIndex}-${setIndex}-${exerciseIndex}`}
                                                                type="file"
                                                                onChange={(e) => handleGifUpload(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex, e)}
                                                            />
                                                            <label htmlFor={`gif-upload-workout-${weekIndex}-${dayIndex}-${setIndex}-${exerciseIndex}`}>
                                                                <Button variant="contained" component="span">
                                                                    Upload Img /GIF
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
                                                                onClick={() => deleteExercise(weekIndex, dayIndex, 'workout', setIndex, exerciseIndex)}
                                                            >
                                                                Delete
                                                            </Button>
                                                           
                                                        </Box>
                                                    ))}
                                                </Box>
                                            ))}
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                )
                }


            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">{isLoading ? 'Adding Program...' : 'Add Program'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddProgramsDialog;
