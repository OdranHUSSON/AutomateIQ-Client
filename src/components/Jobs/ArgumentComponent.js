import React, { useState } from 'react';
import ArgumentForm from './ArgumentForm';
import AddArgumentForm from './AddArgumentForm';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import { Button, Grid, LinearProgress, Box, ButtonGroup, Paper, Card, CardContent, CardHeader, Avatar, TextField, Typography } from '@mui/material';



// Move the corresponding code from the main component to this component
export default function ArgumentComponent({ argumentsState, jobId, handleUpdateArguments, updateJobAndTasks }) {
    const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false);
    const [openAddArgumentDialog, setOpenAddArgumentDialog] = useState(false);

    const handleOpenAddTaskDialog = () => {
        setOpenAddTaskDialog(true);
      };
      
      const handleCloseAddTaskDialog = () => {
        setOpenAddTaskDialog(false);
      };
      
      const handleOpenAddArgumentDialog = () => {
        setOpenAddArgumentDialog(true);
      };
      
      const handleCloseAddArgumentDialog = () => {
        setOpenAddArgumentDialog(false);
      };

    return (
        <Paper sx={{ p: 2, mt:2, borderRadius: 4 }}>
            <Card>
            <CardHeader
                title={"Arguments"}
                avatar={<Avatar>{"A"}</Avatar>}
            />
            <CardContent>
              <Box mt={2} mb={2}>
                {jobId && argumentsState && (
                  <ArgumentForm jobArguments={argumentsState} argumentChangeCallback={handleUpdateArguments} />
                )}
              </Box>
              <Box mb={2}>
                <Dialog open={openAddArgumentDialog} onClose={handleCloseAddArgumentDialog} aria-labelledby="form-dialog-title">
                  <DialogTitle id="form-dialog-title">Add Argument</DialogTitle>
                  <DialogContent>
                    <AddArgumentForm jobId={jobId} callback={updateJobAndTasks} />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseAddArgumentDialog} color="primary">
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton color="primary" onClick={handleOpenAddArgumentDialog}>
                <AddIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Paper>
  );
}
