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
} from '@mui/material';

const AddTaskForm = ({ jobId, tasks }) => {
  const [selectedTask, setSelectedTask] = useState('');
  const [name, setName] = useState('');
  const [args, setArgs] = useState({});
  const [allowedCommands, setAllowedCommands] = useState(null);

  useEffect(() => {
    const fetchAllowedCommands = async () => {
      try {
        const response = await fetch('http://localhost:3000/allowedTasks');
        const data = await response.json();
        setAllowedCommands(data.allowedCommands);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllowedCommands();
  }, []);

  const handleTaskChange = (event) => {
    setSelectedTask(event.target.value);
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
    console.log(body)

    try {
        console.log(JSON.stringify(body))
      const response = await fetch(`http://localhost:3000/api/job/${jobId}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!allowedCommands) {
    return <p>Loading...</p>;
  }

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(`outputFrom=${id}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="jobId" value={jobId} />

      <FormControl variant="outlined" fullWidth margin="normal">
        <InputLabel id="task-label">Task</InputLabel>
        <Select
          labelId="task-label"
          id="task-select"
          value={selectedTask}
          onChange={handleTaskChange}
          label="Task"
        >
          {Object.keys(allowedCommands).map((task) => (
            <MenuItem key={task} value={task}>
              {allowedCommands[task]['label'] || task}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
          key={"name"}
          name={"name"}
          label={"name"}
          fullWidth
          margin="normal"
          onChange={handleNameChange}
        />

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
      <Stack mt={2} mb={2} direction="row" spacing={1}>
        {tasks && tasks.map(task => (
            <Chip color="primary"
            key={task.id} 
            label={" 🪄 " + task.name}
            onClick={() => copyToClipboard(task.id)}
            />
          ))}
      </Stack>

      <Button type="submit" variant="contained" color="primary">
        Add Task
      </Button>
    </form>
  );
};

export default AddTaskForm;
