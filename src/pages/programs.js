import React, { useState, useEffect } from 'react';
import { Typography, Grid, Fab, Box, Card, CardContent, CardMedia, CardActions, IconButton, Chip, CircularProgress } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import AddProgramsDialog from '../components/AddProgramDialog';
import EditProgramsDialog from '../components/EditProgramsDialog';
import { getPrograms, deleteProgram } from '../firebase/programsService';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const programsData = await getPrograms();
        setPrograms(programsData);
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const handleAddClick = () => {
    setOpenAddDialog(true);
  };

  const handleEditClick = (program) => {
    setSelectedProgram(program);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = async (programId, programCategory, level) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      setIsLoading(true);
      try {
        await deleteProgram(programId, programCategory, level);
        setPrograms(programs.filter(p => p.id !== programId));
      } catch (error) {
        console.error("Error deleting program:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddDialogClose = (newProgram) => {
    setOpenAddDialog(false);
    if (newProgram) {
      setPrograms([...programs, newProgram]);
    }
  };

  const handleEditDialogClose = (updatedProgram) => {
    setOpenEditDialog(false);
    if (updatedProgram) {
      try {
        setPrograms(prevPrograms => 
          prevPrograms.map(p => p.id === updatedProgram.id ? updatedProgram : p)
        );
        console.log("Program updated successfully:", updatedProgram);
      } catch (error) {
        console.error("Error updating program in state:", error);
      }
    } else {
      console.log("Edit dialog closed without updates");
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{height: '100vh'}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Typography variant="h4" gutterBottom>Fitness Programs</Typography>
        <Grid container spacing={2}>
          {programs.map((program) => (
            <Grid item xs={12} sm={6} md={4} key={program.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={program.programImageUrl || 'https://via.placeholder.com/120x120?text=No+Image'}
                  alt={program.title}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {program.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Duration: {program.duration}
                  </Typography>
                  <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                    <Chip label={program.level} size="small" />
                    <Chip label={program.guidedOrSelfGuidedProgram} size="small" />
                  </Box>
                </CardContent>
                <CardActions disableSpacing sx={{ mt: 'auto', pt: 0 }}>
                  <IconButton aria-label="edit" onClick={() => handleEditClick(program)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteClick(program.id, program.programCategory, program.level)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Fab color="primary" aria-label="add" onClick={handleAddClick}>
            <AddIcon />
          </Fab>
        </Box>
        <AddProgramsDialog open={openAddDialog} onClose={handleAddDialogClose} />
        {selectedProgram && (
          <EditProgramsDialog
            open={openEditDialog}
            onClose={handleEditDialogClose}
            program={selectedProgram}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default Programs;