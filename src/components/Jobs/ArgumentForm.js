import { useState } from 'react';
import { TextField, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const ArgumentForm = ({ jobArguments, argumentChangeCallback }) => {
  console.log(jobArguments)
  const [argumentValues, setArgumentValues] = useState(jobArguments || []);

  const handleArgumentChange = (event, index) => {
    const updatedArgumentValues = [...argumentValues];
    updatedArgumentValues[index].value = event.target.value;
    setArgumentValues(updatedArgumentValues);
    argumentChangeCallback(updatedArgumentValues);
  };

  return (
    <Box mt={2}>
      {argumentValues.map((argument, index) => (
        <FormControl key={index} mt={2} fullWidth margin='dense'>
          <TextField
            key={index}
            label={argument.name}
            value={argument.value}
            m={2}
            onChange={(event) => handleArgumentChange(event, index)}
          />
        </FormControl>
      ))}
    </Box>
  );
};

export default ArgumentForm;
