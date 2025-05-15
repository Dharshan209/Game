import { io } from 'socket.io-client';

const socket = io("http://game-client.railway.internal"); // or your deployed URL

export default socket;
