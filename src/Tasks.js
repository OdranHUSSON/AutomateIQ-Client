import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';

function TaskTable({ tasks }) {

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
            <TableCell>{task.output}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TaskTable;
