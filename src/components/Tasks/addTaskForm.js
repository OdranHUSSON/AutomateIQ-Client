import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Stack,
  Autocomplete,
  Grid,
} from '@mui/material';

import { apiUrl } from '../../api/config';

const AddTaskForm = ({ jobId, tasks, jobArguments }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [name, setName] = useState('');
  const [args, setArgs] = useState({});
  const [allowedCommands, setAllowedCommands] = useState(null);

  useEffect(() => {
    const fetchAllowedCommands = async () => {
      try {
        const response = await fetch(`${apiUrl}/allowedTasks`);
        const data = await response.json();
        setAllowedCommands(data.allowedCommands);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllowedCommands();
  }, []);

  const handleTaskChange = (newValue) => {
    setSelectedTask(newValue);
    setArgs({});
  };

  const handleArgChange = (event) => {
    setArgs((prevArgs) => ({
      ...prevArgs,
      [event.target.name]: event.target.value,
    }));
  };

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const functionName = selectedTask;
    const body = { functionName, args, jobId, name };

    try {
        console.log(JSON.stringify(body))
      const response = await fetch(`${apiUrl}/api/job/${jobId}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

    } catch (error) {
      console.error(error);
    }
  };

  if (!allowedCommands) {
    return <p>Loading...</p>;
  }

  const copyToClipboard = (id, prefix='outputFrom') => {
    navigator.clipboard.writeText(`${prefix}=${id}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="jobId" value={jobId} />
      {allowedCommands  && (
        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="task-label">Task</InputLabel>
          <Autocomplete
            options={Object.keys(allowedCommands)} 
            getOptionLabel={(option) => allowedCommands[option].label} 
            value={selectedTask}
            onChange={(event, newValue) => handleTaskChange(newValue)}
            renderInput={(params) => <TextField {...params} label="Task" />}
          />
        </FormControl>
      )}


      {selectedTask && allowedCommands && (
        <TextField
            key={"name"}
            name={"name"}
            label={"name"}
            fullWidth
            margin="normal"
            onChange={handleNameChange}
        />
      )}

      {allowedCommands[selectedTask]?.arguments.map((arg) => (
          <TextField
              key={arg}
              name={arg}
              label={arg}
              fullWidth
              margin="normal"
              value={args[arg] || ''}
              multiline
              onChange={handleArgChange}
          />
      ))}

      <Grid container spacing={2} paddingBottom={2} paddingTop={1}>
      {tasks && tasks.map(task => (
          <Grid item>
            <Chip color="primary"
                key={task.id}
                label={" 🪄 " + task.name}
                onClick={() => copyToClipboard(task.taskId)}
            />
          </Grid>
      ))}
      {jobArguments && jobArguments.map(argument => (
        <Grid item>
          <Chip color="success"
            key={argument.name} 
            label={" 🪄 " + argument.name}
            onClick={() => copyToClipboard(argument.name, 'variable')}
          />
        </Grid>
      ))}
      </Grid>


      <Button type="submit" variant="contained" color="primary">
      Add Task
      </Button>
      </form>
  );
};

export default AddTaskForm;
