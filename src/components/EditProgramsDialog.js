import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, InputLabel, FormControl, Chip, Box, Typography, Grid, Checkbox, FormControlLabel, IconButton, CircularProgress } from '@mui/material';
import { handleFileUploadWithReplacement, updateProgram, handleProgramCategoryAndLevelChange } from '../firebase/programsService';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllProgramCategories, addNewProgramCategory, getDayDetails, getWeekDetails, updateDayDetails, updateDayEquipment, updateDayFocus, updateDayLevel, updateDayDuration } from '../firebase/programsService';
import dynamic from 'next/dynamic';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ErrorAlert from './ErrorAlert';

const formatCategoryName = (category) => {
    return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
};

const DaySection = dynamic(() => import('./program-sections/DaySection'), {
    loading: () => <CircularProgress />,
    ssr: false
});

const EditProgramsDialog = ({ open, onClose, program, onCategoryAdded }) => {
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
        weeks: program?.weeks ? program.weeks.map((week, weekIndex) => ({
            days: week.days.map((day, dayIndex) => ({
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
                imageUrl: day?.imageUrl ?? null,
                imageFile: null
            }))
        })) : []
    }));
    const [oldProgram, setOldProgram] = useState(program);
    const [currentTarget, setCurrentTarget] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [programCategories, setProgramCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [expandedWeeks, setExpandedWeeks] = useState({});
    const [loadingWeeks, setLoadingWeeks] = useState({});
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const types = await getAllProgramCategories();
                setProgramCategories(types);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

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
            weeks: program?.weeks ? program.weeks.map((week, weekIndex) => ({
                days: week.days.map((day, dayIndex) => ({
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
                    imageUrl: day?.imageUrl ?? null,
                    imageFile: null
                }))
            })) : []
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

    const deleteSet = (weekIndex, dayIndex, setIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram?.weeks];
            const workout = newWeeks[weekIndex].days[dayIndex].workout;
            const newWorkout = {};
            
            // Rebuild workout object without the deleted set
            Object.entries(workout)
                .filter(([key]) => key !== `set${setIndex + 1}`)
                .forEach(([key, value], index) => {
                    newWorkout[`set${index + 1}`] = value;
                });
                
            newWeeks[weekIndex].days[dayIndex].workout = newWorkout;
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const addExerciseToSet = (weekIndex, dayIndex, setIndex) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            const setKey = `set${setIndex + 1}`;
            if (!newWeeks[weekIndex].days[dayIndex].workout[setKey]) {
                newWeeks[weekIndex].days[dayIndex].workout[setKey] = [];
            }
            newWeeks[weekIndex].days[dayIndex].workout[setKey].push({
                name: '',
                reps: '',
                rest: '',
                tempo: '',
                duration: '',
                gifUrl: null,
                gifFile: null
            });
            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleDayChange = (weekIndex, dayIndex, field, setIndex, exerciseIndex, subField, value) => {
        console.log("handleDayChange", weekIndex, dayIndex, field, setIndex, exerciseIndex, subField, value);
        
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            const day = newWeeks[weekIndex].days[dayIndex];

            // Handle image file uploads
            if (field === 'imageFile') {
                const previewUrl = URL.createObjectURL(value);
                day.imageUrl = previewUrl;
                day.imageFile = value;
                return { ...prevProgram, weeks: newWeeks };
            }

            // Handle simple fields (from DayDetailsSection)
            if (!setIndex && !exerciseIndex && !subField) {
                day[field] = value;
                return { ...prevProgram, weeks: newWeeks };
            }

            // Handle different section types
            switch (field) {
                case 'warmUp':
                    if (!day.warmUp) day.warmUp = [];
                    if (exerciseIndex !== null) {
                        if (!day.warmUp[exerciseIndex]) {
                            day.warmUp[exerciseIndex] = {
                                name: '',
                                duration: '',
                                reps: '',
                                gifUrl: null,
                                gifFile: null
                            };
                        }
                        day.warmUp[exerciseIndex][subField] = value;
                    }
                    break;

                case 'workout':
                    if (!day.workout) day.workout = [];
                    if (setIndex !== null && exerciseIndex !== null) {
                        if (!day.workout[setIndex]) {
                            day.workout[setIndex] = {
                                setName: `Set ${setIndex + 1}`,
                                exercises: []
                            };
                        }
                        if (!day.workout[setIndex].exercises[exerciseIndex]) {
                            day.workout[setIndex].exercises[exerciseIndex] = {
                                name: '',
                                reps: '',
                                rest: '',
                                tempo: '',
                                duration: '',
                                gifUrl: null,
                                gifFile: null
                            };
                        }
                        day.workout[setIndex].exercises[exerciseIndex][subField] = value;
                    }
                    break;

                case 'mindfulness':
                case 'stretch':
                    if (!day[field]) day[field] = [];
                    if (exerciseIndex !== null) {
                        if (!day[field][exerciseIndex]) {
                            day[field][exerciseIndex] = {
                                name: '',
                                duration: '',
                                imageUrl: null,
                                imageFile: null
                            };
                        }
                        day[field][exerciseIndex][subField] = value;
                    }
                    break;

                default:
                    // For any other fields, update directly
                    day[field] = value;
                    break;
            }

            return { ...prevProgram, weeks: newWeeks };
        });
    };

    const handleTargetAreaChange = (weekIndex, dayIndex) => {
        if (currentTarget) {
            const existingTargets = editedProgram?.weeks[weekIndex]?.days[dayIndex]?.targetArea || [];
            const newTarget = currentTarget.split('');  // Convert to array of characters
            handleDayChange(weekIndex, dayIndex, 'targetArea', null, null, null, [...existingTargets, newTarget]);
            setCurrentTarget('');
        }
    };

    const removeTargetArea = (weekIndex, dayIndex, targetIndex) => {
        const newTargetArea = editedProgram?.weeks[weekIndex]?.days[dayIndex]?.targetArea?.filter((_, index) => index !== targetIndex);
        handleDayChange(weekIndex, dayIndex, 'targetArea', null, null, null, newTargetArea);
    };

    const addExercise = (weekIndex, dayIndex, type, setIndex = null) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram?.weeks];
            if (type === 'workout') {
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

    const handleAddExercise = (weekIndex, dayIndex, type, setIndex = null) => {
        setEditedProgram(prevProgram => {
            const newWeeks = [...prevProgram.weeks];
            const day = newWeeks[weekIndex].days[dayIndex];

            switch (type) {
                case 'workout':
                    if (!day.workout) day.workout = [];
                    if (!day.workout[setIndex]) {
                        day.workout[setIndex] = {
                            setName: `Set ${setIndex + 1}`,
                            exercises: []
                        };
                    }
                    day.workout[setIndex].exercises.push({
                        name: '',
                        reps: '',
                        rest: '',
                        tempo: '',
                        duration: '',
                        gifUrl: null,
                        gifFile: null
                    });
                    break;

                case 'mindfulness':
                    if (!day.mindfulness) day.mindfulness = [];
                    day.mindfulness.push({
                name: '',
                duration: '',
                imageUrl: null,
                imageFile: null
            });
                    break;

                case 'stretch':
                    if (!day.stretch) day.stretch = [];
                    day.stretch.push({
                        name: '',
                        duration: '',
                        imageUrl: null,
                        imageFile: null
                    });
                    break;
            }

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsLoading(true);
                const path = `programs/${editedProgram.programCategory}/${editedProgram.level}/${editedProgram.id}/programImageUrl/${file.name}`;
                const downloadUrl = await handleFileUploadWithReplacement(
                    file,
                    editedProgram.programImageUrl,
                    path
                );
                
                setEditedProgram(prev => ({
                    ...prev,
                    programImageUrl: downloadUrl
                }));
            } catch (error) {
                setError("Failed to upload program image: " + error.message);
            } finally {
                setIsLoading(false);
            }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Check if category or level changed
            if (oldProgram.programCategory !== editedProgram.programCategory || 
                oldProgram.level !== editedProgram.level) {
                
                // Move program to new category/level
                await handleProgramCategoryAndLevelChange(
                    oldProgram.programCategory,
                    oldProgram.level,
                    oldProgram.id,
                    editedProgram.programCategory,
                    editedProgram.level
                );
            }

            // Update program data
            const updatedProgram = await updateProgram(
                oldProgram.id, 
                editedProgram,
                editedProgram.programCategory,
                editedProgram.level
            );

            onClose(updatedProgram);
        } catch (error) {
            console.error('Error updating program:', error);
            setError('Failed to update program: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Add this new function near other delete functions
    const deleteExercise = (weekIndex, dayIndex, type, setIndex, exerciseIndex) => {
        setEditedProgram(prevProgram => {
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

    const handleAddCategoryClick = () => {
        setIsAddingCategory(true);
    };

    const handleAddNewCategory = async () => {
        if (newCategory.trim() !== '' && !programCategories.some(cat => cat.name === newCategory)) {
            try {
                await addNewProgramCategory(newCategory);
                const updatedCategories = await getAllProgramCategories();
                setProgramCategories(updatedCategories);
                setEditedProgram({ ...editedProgram, programCategory: newCategory });
                setNewCategory('');
                // Notify parent component about new category
                if (onCategoryAdded) {
                    await onCategoryAdded();
                }
            } catch (error) {
                console.error("Error adding new category:", error);
            }
        }
        setIsAddingCategory(false);
    };

    const handleWeekExpand = async (weekIndex) => {
        if (!expandedWeeks[weekIndex]) {
            setLoadingWeeks(prev => ({ ...prev, [weekIndex]: true }));
            try {
                const weekDetails = await getWeekDetails(
                    program.id, 
                    program.programCategory, 
                    program.level, 
                    weekIndex
                );
                if (weekDetails) {
                    setEditedProgram(prev => {
                        const newWeeks = [...prev.weeks];
                        newWeeks[weekIndex] = weekDetails;
                        return { ...prev, weeks: newWeeks };
                    });
                }
            } catch (error) {
                console.error('Error loading week details:', error);
            } finally {
                setLoadingWeeks(prev => ({ ...prev, [weekIndex]: false }));
                setExpandedWeeks(prev => ({ ...prev, [weekIndex]: true }));
            }
        } else {
            setExpandedWeeks(prev => ({ ...prev, [weekIndex]: false }));
        }
    };

    const handleDayDetailsChange = async (weekIndex, dayIndex, field, value) => {
        try {
            setIsLoading(true);
            const updatedProgram = { ...editedProgram };
            updatedProgram.weeks[weekIndex].days[dayIndex][field] = value;

            // Update in Firebase based on field type
            switch (field) {
                case 'equipment':
                    await updateDayEquipment(
                        program.id,
                        program.programCategory,
                        program.level,
                        weekIndex,
                        dayIndex,
                        value
                    );
                    break;
                case 'focus':
                    await updateDayFocus(
                        program.id,
                        program.programCategory,
                        program.level,
                        weekIndex,
                        dayIndex,
                        value
                    );
                    break;
                case 'level':
                    await updateDayLevel(
                        program.id,
                        program.programCategory,
                        program.level,
                        weekIndex,
                        dayIndex,
                        value
                    );
                    break;
                case 'duration':
                    await updateDayDuration(
                        program.id,
                        program.programCategory,
                        program.level,
                        weekIndex,
                        dayIndex,
                        value
                    );
                    break;
                default:
                    await updateDayDetails(
                        program.id,
                        program.programCategory,
                        program.level,
                        weekIndex,
                        dayIndex,
                        { [field]: value }
                    );
            }

            setEditedProgram(updatedProgram);
        } catch (error) {
            console.error(`Error updating day ${field}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    // Add cleanup on program delete
    const handleDeleteProgram = async () => {
        try {
            setIsLoading(true);
            // Cleanup all images before deleting program
            await Promise.all(editedProgram.weeks.flatMap(week => 
                week.days.flatMap(day => {
                    const images = [
                        day.imageUrl,
                        ...(day.warmUp?.map(ex => ex.gifUrl) || []),
                        ...(day.workout?.flatMap(set => set.exercises.map(ex => ex.gifUrl)) || []),
                        ...(day.mindfulness?.map(ex => ex.imageUrl) || []),
                        ...(day.stretch?.map(ex => ex.imageUrl) || [])
                    ].filter(Boolean);
                    return images.map(url => cleanupUnusedImages(url, null));
                })
            ));
            // Delete program
            await deleteProgram(program.id);
            onClose();
        } catch (error) {
            console.error("Error deleting program:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <Dialog open={open} onClose={() => onClose()} maxWidth="lg" fullWidth>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogContent>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid>
                        <Grid container spacing={2} sx={{ "& .MuiGrid-item": { pt: "25px" } }}>
                            <Grid item xs={12}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Program Category</InputLabel>
                                    <Select
                                        name="programCategory"
                                        value={editedProgram.programCategory}
                                        onChange={handleChange}
                                    >
                                        {programCategories.map((category) => (
                                            <MenuItem key={category.name} value={category.name}>
                                                {formatCategoryName(category.name)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Button onClick={handleAddCategoryClick} variant="outlined" sx={{ mt: 1 }}>
                                        Add New Category
                                    </Button>
                                    {isAddingCategory && (
                                        <Box mt={1}>
                                            <TextField
                                                fullWidth
                                                label="New Category"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                            />
                                            <Button onClick={handleAddNewCategory} variant="contained" sx={{ mt: 1 }}>
                                                Add Category
                                            </Button>
                                        </Box>
                                    )}
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
                                            label={`Week ${weekIndex + 1}`}
                                            onDelete={() => deleteWeek(weekIndex)}
                                            color="primary"
                                            variant="outlined"
                                            />
                                                            <Button
                                                onClick={() => handleWeekExpand(weekIndex)}
                                                endIcon={expandedWeeks[weekIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            >
                                                {expandedWeeks[weekIndex] ? 'Collapse' : 'Expand'}
                                                        </Button>
                                            </Box>
                                            
                                        {loadingWeeks[weekIndex] ? (
                                            <Box display="flex" justifyContent="center" p={2}>
                                                <CircularProgress />
                                                            </Box>
                                        ) : expandedWeeks[weekIndex] && (
                                            <>
                                                <Button onClick={() => addDay(weekIndex)}>Add Day</Button>
                                                {week?.days?.map((day, dayIndex) => (
                                                    <DaySection
                                                        key={dayIndex}
                                                        day={day}
                                                        dayIndex={dayIndex}
                                                        weekIndex={weekIndex}
                                                        program={editedProgram}
                                                        onDayChange={handleDayChange}
                                                        onDeleteDay={deleteDay}
                                                        onAddExercise={handleAddExercise}
                                                        onDeleteExercise={deleteExercise}
                                                        onImageUpload={handleWeeksImageUpload}
                                                        onGifUpload={handleGifUpload}
                                                        onAddSet={addSet}
                                                        onDeleteSet={deleteSet}
                                                    />
                                                ))}
                                            </>
                                        )}
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
            <ErrorAlert 
                error={error} 
                onClose={() => setError(null)} 
            />
        </>
    );
};

export default EditProgramsDialog;
