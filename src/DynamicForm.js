import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';

const DynamicForm = ({ endpointDetails, handleInputChange }) => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    // Generate the fields based on endpoint details
    const newFields = Object.keys(endpointDetails.details).map((fieldName) => (
      <TextField
        fullWidth
        key={fieldName}
        id="standard-basic"
        onChange={handleInputChange}
        label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
        variant="standard"
        name={fieldName}
      />
    ));

    setFields(newFields);
  }, [endpointDetails, handleInputChange]);

  return <div>{fields}</div>;
};

export default DynamicForm;
