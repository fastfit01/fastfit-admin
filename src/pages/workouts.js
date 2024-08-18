// import React from 'react';
// import { Typography } from '@mui/material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';

// const Workouts = () => {
//   return (
    // <ProtectedRoute>
    //   <Layout>
//         <Typography variant="h4">Workouts</Typography>
//         {/* Add your workouts content here */}
//       </Layout>
//     </ProtectedRoute>
//   );
// };

// export default Workouts;


import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import { getWorkouts, deleteWorkout } from '../firebase/workoutsService';
import AddWorkoutDialog from '../components/AddWorkoutDialog';
import EditWorkoutDialog from '../components/EditWorkoutDialog';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const fetchedWorkouts = await getWorkouts();
    setWorkouts(fetchedWorkouts);
  };

  const handleAddWorkout = () => {
    setAddDialogOpen(true);
  };

  const handleEditWorkout = (workout) => {
    setSelectedWorkout(workout);
    setEditDialogOpen(true);
  };

  const handleDeleteWorkout = async (id) => {
    await deleteWorkout(id);
    fetchWorkouts();
  };

  return (

    <ProtectedRoute>

<Layout>
<Container>
      <Typography variant="h4" gutterBottom>Workouts</Typography>
      <Button variant="contained" color="primary" onClick={handleAddWorkout}>Add Workout</Button>
      <Grid container spacing={3}>
        {workouts.map((workout) => (
          <Grid item xs={12} sm={6} md={4} key={workout.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{workout.title}</Typography>
                {/* Display other workout details */}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEditWorkout(workout)}>Edit</Button>
                <Button size="small" onClick={() => handleDeleteWorkout(workout.id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <AddWorkoutDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />
      {selectedWorkout && (
        <EditWorkoutDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          workout={selectedWorkout}
        />
      )}
    </Container>
      
      </Layout>
    </ProtectedRoute>
   
  
  );
};

export default Workouts;