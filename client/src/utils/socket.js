import { io } from 'socket.io-client';

const socket = io('https://game-client-production-c665.up.railway.app');
export default socket;
