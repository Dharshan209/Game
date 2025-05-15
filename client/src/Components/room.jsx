import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import socket from '../utils/socket';

function Room() {
  const { roomId } = useParams();
  const [playerCount, setPlayerCount] = useState(1); // Assume the current user is already in

  useEffect(() => {
    socket.emit('join room', roomId);

    // Listen for player count updates
    socket.on('player-count', (count) => {
      setPlayerCount(count);
    });

    return () => {
      socket.emit('leave room', roomId);
      socket.off('player-count');
    };
  }, [roomId]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold">Room ID: {roomId}</h1>
      <p className="text-lg mt-2">{playerCount} player(s) in the room</p>
    </div>
  );
}

export default Room;
