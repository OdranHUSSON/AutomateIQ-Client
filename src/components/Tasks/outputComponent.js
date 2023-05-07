import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MarkdownViewer from './MarkdownViewer';
import { apiUrl } from '../../api/config';

export default function OutputComponent({ tasks }) {
  return (
    <Paper sx={{ p: 4, borderRadius: 4 }}>
      <Box mt={2} mb={2}>
        <Typography variant="h4">Outputs</Typography>
      </Box>
      {tasks.map((task, index) => (
        <Box key={index} mt={2} mb={2} borderRadius={4}>
          <Typography variant="h6">{task.name}</Typography>
          {(task.status === 'done' || task.status === 'error') && (
            task.output.endsWith('.mp3') ? (
              <audio controls>
                <source src={`${apiUrl}/${task.output}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <MarkdownViewer task={task} />
            )
          )}
        </Box>
      ))}
    </Paper>
  );
}
