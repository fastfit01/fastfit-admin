import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ProblemAreaWorkoutCard = ({ workout, onEdit, onDelete }) => {
  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '350px',
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
        image={workout.imageUrl || '/placeholder-workout-image.jpg'}
        alt={workout.name}
        sx={{ objectFit: 'cover' }}
      />
      {workout.gifUrl && (
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          width: '80px', 
          height: '80px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <img 
            src={workout.gifUrl} 
            alt={`${workout.name} GIF`} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, p: 1.5, overflow: 'auto' }}>
        <Typography variant="subtitle1" component="div" noWrap>
          {workout.name}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}
        >
          {workout.description}
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

export default ProblemAreaWorkoutCard;