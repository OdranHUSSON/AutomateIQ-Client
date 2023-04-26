import React, { useCallback } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import axios from 'axios';

function TaskTable({ tasks, handleViewOutput, jobId }) {

  function colorFromStatus(status) {
    switch (status) {
      case 'done':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'pending':
        return 'primary';
      default:
        return 'danger';
    }
  }

  const restartTask = async (taskId) => {
    console.log(jobId, taskId)
    try {
      const response = await axios.get(`http://localhost:3000/job/${jobId}/restart/${taskId}`);
      if (response.data.status === "ok") {
        console.log("Task restarted successfully.");
        // You can update your component state or do other necessary actions here.
      } else {
        console.error("Error occurred while restarting the task:", response.data.error);
      }
    } catch (error) {
      console.error("Error occurred while making the API call:", error.message);
    }
  };
  

  const handleClick = useCallback((task) => {
    console.log(task)
    handleViewOutput(task)
  }, [handleViewOutput]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Status</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Output</TableCell>
          <TableCell>Progress</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map(task => (
          <TableRow key={task.id}>
            <TableCell>
              <Chip label={task.status} color={colorFromStatus(task.status)} />
            </TableCell>
            <TableCell>{task.name}</TableCell>
            <TableCell>
              <Button onClick={() => handleClick(task)}>View Output</Button>
              <Button onClick={() => restartTask(task.id)}>Restart</Button>
            </TableCell>
            <TableCell>
              {task.status === 'in progress' && (
                  <CircularProgress />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TaskTable;
