import React from 'react';
import { Menu, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Visibility, Replay, Delete } from '@mui/icons-material';

function TaskMenu({ anchorEl, handleMenuClose, task, restartTask, deleteTask }) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <ListSubheader>Task Actions</ListSubheader>
      <ListItem button onClick={() => restartTask(task.id)}>
        <ListItemIcon>
          <Replay />
        </ListItemIcon>
        <ListItemText primary="Restart" />
      </ListItem>
      <ListItem button onClick={() => deleteTask(task.id)}>
        <ListItemIcon>
          <Delete />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </ListItem>
    </Menu>
  );
}

export default TaskMenu;
