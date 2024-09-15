import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchField = ({ value, onChange, placeholder }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder || "Search..."}
      value={value}
      onChange={onChange}
      sx={{ mb: 3 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchField;