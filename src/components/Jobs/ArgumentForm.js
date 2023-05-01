import { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

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
    <form>
      {argumentValues.map((argument, index) => (
        <div key={index}>
          <TextField
            key={index}
            label={argument.name}
            value={argument.value}
            onChange={(event) => handleArgumentChange(event, index)}
            fullWidth
          />
        </div>
      ))}
    </form>
  );
};

export default ArgumentForm;
