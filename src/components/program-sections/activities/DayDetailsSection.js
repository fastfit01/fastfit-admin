import React, { useState } from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel, Button, IconButton } from '@mui/material';
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

    const handleEquipmentChange = (e) => {
        try {
            onDayChange(weekIndex, dayIndex, 'description', null, null, null, e.target.value);
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
                
                <Box mt={2} mb={2}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`day-image-upload-${weekIndex}-${dayIndex}`}
                        type="file"
                        onChange={onImageUpload}
                    />
                    <label htmlFor={`day-image-upload-${weekIndex}-${dayIndex}`}>
                        <Button variant="contained" component="span">
                            {day.imageUrl ? 'Change Day Image' : 'Upload Day Image'}
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
                        value={day.level || ''}
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

                <TextField
                    fullWidth
                    label="Equipment needed (use commas to separate items)"
                    value={day.description || ''}
                    onChange={handleEquipmentChange}
                    placeholder="e.g., dumbbells, yoga mat, resistance bands"
                    margin="normal"
                    multiline
                    rows={2}
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
            </Box>
            <ErrorAlert 
                error={error} 
                onClose={() => setError(null)} 
            />
        </>
    );
};

export default DayDetailsSection; 