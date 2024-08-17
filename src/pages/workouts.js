import React from 'react';
import { Typography } from '@mui/material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';

const Workouts = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Typography variant="h4">Workouts</Typography>
        {/* Add your workouts content here */}
      </Layout>
    </ProtectedRoute>
  );
};

export default Workouts;