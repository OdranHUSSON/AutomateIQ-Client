import React, { useCallback } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import axios from 'axios';
import TaskMenu from './TaskMenu';

function TaskTable({ tasks, jobId }) {

  function colorFromStatus(status = "unknown") {
    switch (status) {
      case 'done':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'pending':
        return 'primary';
      case 'error':
        return 'error';
      default:
        return 'error';
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
  
  const deleteTask = async (taskId) => {
    console.log("delete", taskId)
    try {
      const response = await axios.delete(`http://localhost:3000/job/${jobId}/task/${taskId}`);
      if (response.data.status === "ok") {
        console.log("Task deleted successfully.");
        // You can update your component state or do other necessary actions here.
      } else {
        console.error("Error occurred while deleting the task:", response.data.error);
      }
    } catch (error) {
      console.error("Error occurred while making the API call:", error.message);
    }
  };

  // TASK DROPDOWN MENU
  const [anchorEls, setAnchorEls] = React.useState({});

  const handleMenuClick = (event, taskId) => {
    console.log('handleMenuClick', event, taskId);
    setAnchorEls({ ...anchorEls, [taskId]: event.currentTarget });
    console.log('anchorEls', anchorEls);
  };

  const handleMenuClose = (taskId) => {
    const newAnchorEls = { ...anchorEls };
    delete newAnchorEls[taskId];
    setAnchorEls(newAnchorEls);
    console.log('anchorEls', anchorEls);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Status</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map(task => (
          <TableRow key={task.id}>
            <TableCell>
              <Chip label={task.status ?? 'unknown'} color={colorFromStatus(task.status)} />
            </TableCell>
            <TableCell>{task.name}</TableCell>
            <TableCell>
            {task.status === 'in progress' ? (
              <CircularProgress size={20}/>
            ) : (
              <div>
                <IconButton onClick={(event) => handleMenuClick(event, task.taskId)}>
                    <MoreVertIcon />
                </IconButton>
                {task.status === 'done' || task.status === 'error' || task.status === 'pending' ? (
                  <TaskMenu
                    anchorEl={anchorEls[task.taskId]}
                    handleMenuClose={() => handleMenuClose(task.taskId)}
                    task={task}
                    restartTask={() => restartTask(task.taskId)}
                    deleteTask={() => deleteTask(task.taskId)}
                  />
                ) : null}
              </div>
            )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TaskTable;
