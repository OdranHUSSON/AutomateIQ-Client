import React, { useCallback } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Chip, Button } from '@mui/material';

function TaskTable({ tasks, handleViewOutput }) {

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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TaskTable;
