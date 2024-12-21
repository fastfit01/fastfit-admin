import React, { useState, useEffect, Suspense } from 'react';
import { Typography, Grid, Fab, Box, Tabs, Tab, CircularProgress, Container, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import TabPanel from '../components/TabPanel';
import SearchField from '../components/SearchField';
import dynamic from 'next/dynamic';
import { getProgramsByCategory, deleteProgram, getAllProgramCategories } from '../firebase/programsService';

// Dynamically import dialogs
const AddProgramsDialog = dynamic(() => import('../components/AddProgramDialog'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const EditProgramsDialog = dynamic(() => import('../components/EditProgramsDialog'), {
  loading: () => <CircularProgress />,
  ssr: false
});

// Lazy load the ProgramCard component
const ProgramCard = dynamic(() => import('../components/ProgramCard'), {
  loading: () => <CircularProgress />,
  ssr: false
});

const Programs = () => {
  const [programs, setPrograms] = useState({});
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    const fetchProgramsByCategory = async () => {
      const category = categories[currentTab];
      
      // Don't fetch if we already have the data
      if (programs[category]) {
        return;
      }

      setIsLoading(true);
      try {
        const programsData = await getProgramsByCategory(category);
        setPrograms(prev => ({
          ...prev,
          [category]: programsData
        }));
      } catch (error) {
        console.error(`Error fetching ${category} programs:`, error);
        // Initialize with empty array on error
        setPrograms(prev => ({
          ...prev,
          [category]: []
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramsByCategory();
  }, [currentTab, categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const types = await getAllProgramCategories();
        setCategories(types.map(type => type.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleTabChange = async (event, newValue) => {
    setCurrentTab(newValue);
    const category = categories[newValue];
    
    if (!programs[category]) {
      setLoadingStates(prev => ({ ...prev, [category]: true }));
      try {
        const programsData = await getProgramsByCategory(category);
        setPrograms(prev => ({
          ...prev,
          [category]: programsData
        }));
      } catch (error) {
        console.error(`Error fetching ${category} programs:`, error);
        setPrograms(prev => ({
          ...prev,
          [category]: []
        }));
      } finally {
        setLoadingStates(prev => ({ ...prev, [category]: false }));
      }
    }
  };

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
        setPrograms(prev => ({
          ...prev,
          [programCategory]: prev[programCategory].filter(p => p.id !== programId)
        }));
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
      setPrograms(prev => ({
        ...prev,
        [newProgram.programCategory]: prev[newProgram.programCategory] ? 
          [...prev[newProgram.programCategory], newProgram] : 
          [newProgram]
      }));
    }
  };

  const handleEditDialogClose = async (updatedProgram) => {
    setOpenEditDialog(false);
    if (updatedProgram) {
      try {
        setIsLoading(true);
        
        // Fetch fresh data for both old and new categories if they're different
        if (selectedProgram.programCategory !== updatedProgram.programCategory) {
          const [oldCategoryData, newCategoryData] = await Promise.all([
            getProgramsByCategory(selectedProgram.programCategory),
            getProgramsByCategory(updatedProgram.programCategory)
          ]);
          
          setPrograms(prev => ({
            ...prev,
            [selectedProgram.programCategory]: oldCategoryData,
            [updatedProgram.programCategory]: newCategoryData
          }));
        } else {
          // If same category, just refresh that category
          const refreshedData = await getProgramsByCategory(updatedProgram.programCategory);
          setPrograms(prev => ({
            ...prev,
            [updatedProgram.programCategory]: refreshedData
          }));
        }

        console.log("Program updated successfully:", updatedProgram);
      } catch (error) {
        console.error("Error updating program in state:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setSelectedProgram(null);
  };

  const getCurrentCategoryPrograms = () => {
    const category = categories[currentTab];
    const categoryPrograms = programs[category] || [];
    
    return categoryPrograms.filter(program =>
      program?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program?.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program?.guidedOrSelfGuidedProgram?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatCategoryName = (category) => {
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Fitness Programs
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="program categories tabs"
            >
              {categories.map((category, index) => (
                <Tab 
                  key={category} 
                  label={formatCategoryName(category)}
                  id={`tab-${index}`}
                  aria-controls={`tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          <SearchField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search programs..."
          />

          {categories.map((category, index) => (
            <TabPanel key={category} value={currentTab} index={index}>
              {(isLoading || loadingStates[category]) ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <Suspense fallback={<CircularProgress />}>
                  <Grid container spacing={2}>
                    {getCurrentCategoryPrograms().map((program) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={program.id}>
                        <ProgramCard
                          program={program}
                          onEdit={() => handleEditClick(program)}
                          onDelete={() => handleDeleteClick(program.id, program.programCategory, program.level)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Suspense>
              )}
            </TabPanel>
          ))}

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