import React, { useState } from 'react';
import TaskTable from '../Tasks/Tasks';
import AddTaskForm from '../Tasks/addTaskForm';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import { Button, Grid, LinearProgress, Box, ButtonGroup, Paper, Card, CardContent, CardHeader, Avatar, TextField, Typography } from '@mui/material';

export default function TaskComponent({ tasks, jobId, handleTaskUpdate, argumentsState }) {
    const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false);
    const [openAddArgumentDialog, setOpenAddArgumentDialog] = useState(false);

    const handleOpenAddTaskDialog = () => {
        setOpenAddTaskDialog(true);
      };
      
      const handleCloseAddTaskDialog = () => {
        setOpenAddTaskDialog(false);
      };
    

    return (
        <Paper sx={{ p: 2, mt:4, borderRadius: 4 }}>
          <Card>
            <CardContent>
              <CardHeader
                  title={"Tasks"}
                  avatar={<Avatar>{"T"}</Avatar>}
                />
              <Box mb={2}>
                {jobId && tasks && tasks.length > 0 && (
                  <TaskTable tasks={tasks} onTaskUpdate={handleTaskUpdate} jobId={jobId} />                
                )}
              </Box>
              <Box mb={2}>
                <Dialog open={openAddTaskDialog} onClose={handleCloseAddTaskDialog} aria-labelledby="form-dialog-title" fullWidth={true}>
                  <DialogTitle id="form-dialog-title">Add a Task</DialogTitle>
                  <DialogContent>
                    <AddTaskForm jobId={jobId} tasks={tasks} jobArguments={argumentsState} />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseAddTaskDialog} color="primary">
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton color="primary" onClick={handleOpenAddTaskDialog}>
                <AddIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Paper>
  );
}
