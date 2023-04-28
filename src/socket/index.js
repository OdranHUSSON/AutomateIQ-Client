import io from 'socket.io-client';
import { apiUrl } from '../api/config.js';

const socket = io(apiUrl);

export default socket;
