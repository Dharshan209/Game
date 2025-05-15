import { io } from 'socket.io-client';

const socket = io("http://game-client-production-c665.up.railway.app"); // or your deployed URL

export default socket;
