import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorAlert from '../../ErrorAlert';

const DayDetailsSection = ({
    day,
    weekIndex,
    dayIndex,
    onDayChange,
    onDeleteDay,
    onImageUpload
}) => {
    const [error, setError] = useState(null);
    const [currentTarget, setCurrentTarget] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleEquipmentChange = (e) => {
        try {
            onDayChange(weekIndex, dayIndex, 'equipment', null, null, null, e.target.value);
        } catch (error) {
            setError(`Failed to update equipment: ${error.message}`);
        }
    };

    const handleLevelChange = (e) => {
        onDayChange(weekIndex, dayIndex, 'level', null, null, null, e.target.value);
    };

    const handleFocusChange = (e) => {
        onDayChange(weekIndex, dayIndex, 'focus', null, null, null, e.target.value);
    };

    const handleDurationChange = (e) => {
        onDayChange(weekIndex, dayIndex, 'duration', null, null, null, e.target.value);
    };

    const handleTargetAreaChange = () => {
        if (currentTarget) {
            const existingTargets = day.targetArea || [];
            onDayChange(weekIndex, dayIndex, 'targetArea', null, null, null, [...existingTargets, currentTarget]);
            setCurrentTarget('');
        }
    };

    const removeTargetArea = (targetIndex) => {
        const newTargetArea = (day.targetArea || []).filter((_, index) => index !== targetIndex);
        onDayChange(weekIndex, dayIndex, 'targetArea', null, null, null, newTargetArea);
    };

    const handleImageUpload = async (e) => {
        setIsUploading(true);
        await onImageUpload(e);
        setIsUploading(false);
    };

    return (
        <>
            <Box mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">Day {dayIndex + 1} Details</Typography>
                    <IconButton 
                        onClick={() => onDeleteDay(weekIndex, dayIndex)}
                        color="error"
                        aria-label="delete day"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>

                <TextField
                    fullWidth
                    label="Title"
                    value={day.title || ''}
                    onChange={(e) => onDayChange(weekIndex, dayIndex, 'title', null, null, null, e.target.value)}
                    placeholder="Day Title"
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Description"
                    value={day.description || ''}
                    onChange={(e) => onDayChange(weekIndex, dayIndex, 'description', null, null, null, e.target.value)}
                    placeholder="Day Description"
                    margin="normal"
                    multiline
                    rows={2}
                />

                <TextField
                    fullWidth
                    label="Equipment needed"
                    value={day.equipment || ''}
                    onChange={handleEquipmentChange}
                    placeholder="e.g., dumbbells, yoga mat, resistance bands"
                    margin="normal"
                />
                
                <Box mt={2} mb={2}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`day-image-upload-${weekIndex}-${dayIndex}`}
                        type="file"
                        onChange={handleImageUpload}
                    />
                    <label htmlFor={`day-image-upload-${weekIndex}-${dayIndex}`}>
                        <Button variant="contained" component="span">
                            {isUploading ? 'Uploading...' : (day.imageUrl ? 'Change Day Image' : 'Upload Day Image')}
                        </Button>
                    </label>
                    {day.imageUrl && (
                        <Box mt={1}>
                            <img
                                src={day.imageUrl}
                                alt="Day Preview"
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                }}
                            />
                        </Box>
                    )}
                </Box>

                <TextField
                    fullWidth
                    label="Duration"
                    value={day.duration || ''}
                    onChange={handleDurationChange}
                    placeholder="e.g., 30-45 Mins"
                    margin="normal"
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Level</InputLabel>
                    <Select
                        value={day?.level || ''}
                        onChange={handleLevelChange}
                        label="Level"
                    >
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="Focus"
                    value={day.focus || ''}
                    onChange={handleFocusChange}
                    placeholder="e.g., Upper Body, Core, etc."
                    margin="normal"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={day.isOptional || false}
                            onChange={(e) => onDayChange(weekIndex, dayIndex, 'isOptional', null, null, null, e.target.checked)}
                        />
                    }
                    label="Optional Day"
                />

                <Box mt={2}>
                    <Typography variant="subtitle2">Target Areas</Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <TextField
                            label="Add Target Area"
                            value={currentTarget}
                            onChange={(e) => setCurrentTarget(e.target.value)}
                            size="small"
                        />
                        <Button 
                            onClick={handleTargetAreaChange}
                            variant="contained"
                            size="small"
                        >
                            Add
                        </Button>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {day.targetArea?.map((target, index) => (
                            <Chip
                                key={index}
                                label={target}
                                onDelete={() => removeTargetArea(index)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            </Box>
            <ErrorAlert 
                error={error} 
                onClose={() => setError(null)} 
            />
        </>
    );
};

export default DayDetailsSection; 