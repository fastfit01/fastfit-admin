import React, { useState, useEffect } from 'react';
import { Typography, Grid, Fab, Box, Card, CardContent, CardMedia, IconButton, Chip, CircularProgress, Container, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import AddProgramsDialog from '../components/AddProgramDialog';
import EditProgramsDialog from '../components/EditProgramsDialog';
import { getPrograms, deleteProgram } from '../firebase/programsService';
import SearchField from '../components/SearchField';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.guidedOrSelfGuidedProgram.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Layout>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Fitness Programs
          </Typography>
          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search programs..."
          />
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredPrograms.map((program) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={program.id}>
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
                        <IconButton size="small" onClick={() => handleEditClick(program)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(program.id, program.programCategory, program.level)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <Tooltip title="Add new program">
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleAddClick}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
          <AddProgramsDialog open={openAddDialog} onClose={handleAddDialogClose} />
          {selectedProgram && (
            <EditProgramsDialog
              open={openEditDialog}
              onClose={handleEditDialogClose}
              program={selectedProgram}
            />
          )}
        </Container>
      </Layout>
    </ProtectedRoute>
  );
};

export default Programs;