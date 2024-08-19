import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Fab, Box, Chip, Card, CardContent, CardMedia, CircularProgress, Dialog, DialogContent } from '@mui/material';
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
        console.log("program.programImageUrl=>", programsData);
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

  const handleDeleteClick = async (programCategory, programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      setIsLoading(true);
      try {
        await deleteProgram(programId, programCategory);
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
      setIsLoading(true);
      try {
        setPrograms([...programs, newProgram]);
      } catch (error) {
        console.error("Error adding program:", error);
      } finally {
        setIsLoading(false);
      }
    }

  };

  const handleEditDialogClose = (updatedProgram) => {
    setOpenEditDialog(false);
    if (updatedProgram) {
      setIsLoading(true);
      try {
        setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p));
      } catch (error) {
        console.error("Error updating program:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setSelectedProgram(null);
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
        <List>
          {programs.map((program) => (
            <ListItem key={program.id}>
              <Card style={{ display: 'flex', width: '100%' }}>
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                  {program.programImageUrl ? (
                    <CardMedia
                      component="img"
                      src={program.programImageUrl}
                      alt={program.title}
                      style={{ width: 100, height: 100, borderRadius: '10%', marginTop: 16, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: '10%',
                        marginTop: 16,
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body2">No Image</Typography>
                    </Box>
                  )}
                </Box>

                <CardContent style={{ flex: 1 }}>
                  <ListItemText
                    primary={program.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {`Duration: ${program.duration} | Level: ${program.level} | Guided: ${program.guidedOrSelfGuidedProgram}`}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="textSecondary">
                          Target Areas:
                        </Typography>
                        {program?.targetArea?.map((target, index) => (
                          <Chip key={index} label={target} size="small" style={{ marginRight: 4, marginBottom: 4 }} />
                        ))}
                      </>
                    }
                  />
                </CardContent>

                <ListItemSecondaryAction sx={{ mr: "30px" }}>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(program)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(program.programCategory, program.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </Card>
            </ListItem>
          ))}
        </List>
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