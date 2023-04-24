import React, { useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { InputLabel, Button, createTheme, ThemeProvider, Grid, LinearProgress, FormControl, Select, MenuItem, ButtonGroup, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkdownViewer from './MarkdownViewer';
import DynamicForm from './DynamicForm';
import TaskTable from './Tasks';
import CustomizedSnackbars from './Snackbar';
import AddTaskForm from './addTaskForm';

const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);

function Jobs() {


  return (
    <ThemeProvider theme={darkTheme}>
    <main>
      <Header />
      <div id="container">
      <Grid container spacing={2}>
      </Grid>
      </div>
    </main>
    </ThemeProvider>
  );
}

export default App;
