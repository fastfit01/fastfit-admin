import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ProgramCard = ({ program, onEdit, onDelete }) => {
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
        image={program.programImageUrl || 'https://via.placeholder.com/140x140?text=No+Image'}
        alt={program.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, p: 1.5, overflow: 'auto' }}>
        <Typography variant="subtitle1" component="div" noWrap>
          {program.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Duration: {program.duration}
        </Typography>
        <Box sx={{ mb: 0.5 }}>
          <Chip
            label={program.level}
            size="small"
            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem', height: '16px' }}
          />
          <Chip
            label={program.guidedOrSelfGuidedProgram}
            size="small"
            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.6rem', height: '16px' }}
          />
        </Box>
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

export default ProgramCard; 