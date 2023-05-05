import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';

function JobId({ jobId }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(jobId);
    setIsCopied(true);
  };

  return (
    <Box display="flex" alignItems="center">
      <TextField
        variant="outlined"
        label="Job ID"
        disabled
        value={jobId}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <Button
              color="primary"
              onClick={handleCopyClick}
              disabled={false}
            >
              <FileCopyIcon />
            </Button>
          ),
        }}
        sx={{ mr: 1, width: '100%' }}
      />
    </Box>
  );
}

export default JobId;
