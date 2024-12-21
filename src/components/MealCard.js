import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const MealCard = ({ meal, onEdit, onDelete }) => {
  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '300px',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.03)',
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
      },
    }}>
      <CardMedia
        component="img"
        height="140"
        image={meal.imageUrl || '/placeholder-meal-image.jpg'}
        alt={meal.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, p: 1.5, overflow: 'auto' }}>
        <Typography variant="subtitle1" component="div" noWrap>
          {meal.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {`${meal.dietType} - ${meal.mealTime}`}
        </Typography>
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default MealCard; 