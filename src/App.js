import React, { useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const apiUrl = 'http://localhost:3000';
const socket = io(apiUrl);

function App() {
  const [details, setDetails] = useState({
    context: '',
    actors: '',
    initiative: '',
  });

  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setDetails({ ...details, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProgress(0);
    setDone(false);
    const jobId = await generatePRD(details, 1);
    setJobId(jobId);
  };

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('message', 'Hello from client');
  });

  socket.on('update', (data) => {
    console.log(`Server says job ${data.jobId} has progressed to : ${data.progress}`);
    if (data.jobId === jobId) {
      setProgress(data.progress);
      if (data.progress === 100) {
        setDone(true);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  const generatePRD = async (details, temperature) => {
    try {
      const response = await axios.post(apiUrl + '/api/generatePRD', {
        details: details,
        temperature: temperature,
      });
      return response.data.jobId;
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Context:
          <input type="text" name="context" value={details.context} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Actors:
          <input type="text" name="actors" value={details.actors} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Initiative:
          <input type="text" name="initiative" value={details.initiative} onChange={handleInputChange} />
        </label>
        <br />
        <button type="submit">Generate PRD</button>
      </form>
      {jobId && (
        <div>
          <p>Generating with jobId: {jobId}</p>
          {progress > 0 && <p>Progress: {progress}%</p>}
          {done && <p>Done!</p>}
        </div>
      )}
    </div>
  );
}

export default App;
