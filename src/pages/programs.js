import React, { useState, useEffect, Suspense } from 'react';
import { Typography, Grid, Fab, Box, Tabs, Tab, CircularProgress, Container, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import TabPanel from '../components/TabPanel';
import SearchField from '../components/SearchField';
import dynamic from 'next/dynamic';
import { getProgramsByCategory, deleteProgram, getAllProgramCategories, deleteProgramCategory } from '../firebase/programsService';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setCategories(types.map(type => type.name || type));
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

  const handleDeleteClick = async (program) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        setIsLoading(true);
        await deleteProgram(
          program.id,
          program.programCategory,
          program.level
        );
        
        // Update local state after successful deletion
        setPrograms(prev => ({
          ...prev,
          [program.programCategory]: prev[program.programCategory].filter(p => p.id !== program.id)
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
    if (!category) return '';
    
    // If it's already a string, use it directly
    const categoryName = typeof category === 'string' ? category : category.name;
    
    return categoryName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  const handleCategoryAdded = async () => {
    try {
      const types = await getAllProgramCategories();
      setCategories(types.map(type => type.name || type));
    } catch (error) {
      console.error("Error refreshing categories:", error);
    }
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      setIsDeleting(true);
      setIsLoading(true);
      try {
        await deleteProgramCategory(categoryToDelete);
        const types = await getAllProgramCategories();
        const categoryNames = types.map(type => type.name || type);
        setCategories(categoryNames);
        setCurrentTab(0);
        
        if (categoryNames.length > 0) {
          const programsData = await getProgramsByCategory(categoryNames[0]);
          setPrograms(prev => ({
            ...prev,
            [categoryNames[0]]: programsData
          }));
        }
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        setIsLoading(false);
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
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
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {formatCategoryName(category)}
                      {categories.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
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
                          onDelete={() => handleDeleteClick(program)}
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

          <AddProgramsDialog 
            open={openAddDialog} 
            onClose={handleAddDialogClose} 
            onCategoryAdded={handleCategoryAdded}
          />
          {selectedProgram && (
            <EditProgramsDialog
              open={openEditDialog}
              onClose={handleEditDialogClose}
              program={selectedProgram}
              onCategoryAdded={handleCategoryAdded}
            />
          )}

          <Dialog
            open={deleteDialogOpen}
            onClose={() => !isDeleting && setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Category</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                Are you sure you want to delete the category "{categoryToDelete}"? 
                This will permanently delete all programs in this category.
              </Box>
              {isDeleting && (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setDeleteDialogOpen(false)} 
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                color="error"
                disabled={isDeleting}
                startIcon={isDeleting ? <CircularProgress size={20} /> : null}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Layout>
    </ProtectedRoute>
  );
};

export default Programs;