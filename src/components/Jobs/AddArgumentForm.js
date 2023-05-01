import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { apiUrl } from '../../api/config';

const AddArgumentForm = ({ jobId }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('string');

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleValueChange = (event) => {
    setValue(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/api/job/${jobId}/argument`, { type, name, value });

      console.log(response.data);
      // Do something with the response data, like updating the UI or displaying a success message
    } catch (error) {
      console.error(error);
      // Handle the error, like displaying an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    <FormControl fullWidth margin='dense'>
        <TextField
            label="Argument Name"
            value={name}
            onChange={handleNameChange}
            fullWidth
            mt={2}
        />
      </FormControl>
      <FormControl fullWidth margin='dense'>
        <TextField
            label="Argument Value"
            value={value}
            onChange={handleValueChange}
            fullWidth
            mt={2}
        />
      </FormControl>
      <FormControl fullWidth margin='dense'>
        <InputLabel>Argument Type</InputLabel>
        <Select
          value={type}
          onChange={handleTypeChange}
        >
          <MenuItem value="string">String</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="boolean">Boolean</MenuItem>
        </Select>
      </FormControl>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
      >
        Add Argument
      </Button>
    </form>
  );
};

export default AddArgumentForm;
