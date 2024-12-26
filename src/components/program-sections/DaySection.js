import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { handleDayImageUpload as uploadDayImage } from '../../firebase/programsService';
import WarmUpSection from './activities/WarmUpSection';
import WorkoutSection from './activities/WorkoutSection';
import MindfulnessSection from './activities/MindfulnessSection';
import StretchSection from './activities/StretchSection';
import DayDetailsSection from './activities/DayDetailsSection';

const DaySection = ({ 
    day, 
    dayIndex, 
    weekIndex, 
    program,
    onDayChange,
    onDeleteDay,
    onAddExercise,
    onDeleteExercise,
    onAddSet,
    onDeleteSet
}) => {
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const downloadUrl = await uploadDayImage(
                    program.id,
                    program.programCategory,
                    program.level,
                    weekIndex,
                    dayIndex,
                    file
                );
                onDayChange(weekIndex, dayIndex, 'imageUrl', null, null, null, downloadUrl);
            } catch (error) {
                console.error("Error uploading day image:", error);
            }
        }
    };

    return (
        <Box mt={2} border={1} borderColor="grey.300" p={2}>
            <DayDetailsSection 
                day={day}
                dayIndex={dayIndex}
                weekIndex={weekIndex}
                onDayChange={onDayChange}
                onDeleteDay={onDeleteDay}
                onImageUpload={handleImageUpload}
            />
            
            <WarmUpSection 
                warmUp={day.warmUp}
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                program={program}
                onExerciseChange={onDayChange}
                onAddExercise={onAddExercise}
                onDeleteExercise={onDeleteExercise}
            />
            
            <WorkoutSection 
                workout={day.workout}
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                program={program}
                onExerciseChange={onDayChange}
                onAddExercise={onAddExercise}
                onDeleteExercise={onDeleteExercise}
                onAddSet={onAddSet}
                onDeleteSet={onDeleteSet}
            />
            
            <MindfulnessSection 
                mindfulness={day.mindfulness}
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                program={program}
                onExerciseChange={onDayChange}
                onAddExercise={onAddExercise}
                onDeleteExercise={onDeleteExercise}
            />
            
            <StretchSection 
                stretch={day.stretch}
                weekIndex={weekIndex}
                dayIndex={dayIndex}
                program={program}
                onExerciseChange={onDayChange}
                onAddExercise={onAddExercise}
                onDeleteExercise={onDeleteExercise}
            />
        </Box>
    );
};

export default DaySection;
