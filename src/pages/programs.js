import React from 'react';
import { Typography } from '@mui/material';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';

export default function Programs() {
  return (
    <ProtectedRoute>
      <Layout>
        <Typography variant="h4">Programs</Typography>
        {/* Add your programs content here */}
      </Layout>
    </ProtectedRoute>
  );
};

 