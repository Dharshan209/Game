import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import socket from '../utils/socket';
import PlayerVideo from './PlayerVideo';
import GameUI from './GameUI';
import GameInstructions from './GameInstructions';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [username, setUsername] = useState(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) return storedUsername;
    
    // Try to get username from user object
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || 'Anonymous';
  });
  
  // State
  const [playerCount, setPlayerCount] = useState(1);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [playerRole, setPlayerRole] = useState(null);
  const [roundEnded, setRoundEnded] = useState(false);
  const [scores, setScores] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [winners, setWinners] = useState([]);
  const [playerEmojis, setPlayerEmojis] = useState({});
  const [revealRoles, setRevealRoles] = useState(false);
  
  // Refs
  const errorHandledRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const hasSetupGameRef = useRef(false);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // key: socketId, value: RTCPeerConnection

  // Join room and set up socket listeners
  useEffect(() => {
    // Check for user authentication
    if (!localStorage.getItem('user')) {
      navigate('/');
      return;
    }
    
    console.log(`Attempting to join room: ${roomId}`);
    
    // Join the room
    if (!hasJoinedRef.current) {
      socket.emit('join room', roomId);
      hasJoinedRef.current = true;
    }
    
    // Setup event handlers
    
    // Room events
    function handleRoomJoined(joinedRoomId) {
      console.log(`Successfully joined room: ${joinedRoomId}`);
      
      if (!hasSetupGameRef.current) {
        // Join the game with username
        socket.emit('game:join', { 
          roomId: joinedRoomId, 
          username 
        });
        hasSetupGameRef.current = true;
        
        // Get users in room
        socket.emit('room:get-users', joinedRoomId);
      }
    }
    
    function handlePlayerCount(count) {
      setPlayerCount(count);
    }
    
    function handleAllUsers(users) {
      users.forEach(userId => {
        callUser(userId);
      });
    }
    
    function handleRoomError(msg) {
      console.error(`Room error: ${msg}`);
      if (!errorHandledRef.current) {
        errorHandledRef.current = true;
        alert(`Error: ${msg}`);
        navigate('/Home');
      }
    }
    
    // WebRTC events
    socket.on('room-joined', handleRoomJoined);
    socket.on('player-count', handlePlayerCount);
    socket.on('all users', handleAllUsers);
    socket.on('offer', handleReceiveOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleNewICECandidate);
    socket.on('user-disconnected', handleUserDisconnected);
    socket.on('room-error', handleRoomError);
    
    // Game Events
    socket.on('game:state', handleGameState);
    socket.on('game:started', handleGameStarted);
    socket.on('game:role', handleRoleAssignment);
    socket.on('game:new-round', handleNewRound);
    socket.on('game:guess-result', handleGuessResult);
    socket.on('game:round-end', handleRoundEnd);
    socket.on('game:ended', handleGameEnd);
    socket.on('game:emoji', handleEmojiReceived);

    return () => {
      // Leave room
      socket.emit('leave room', roomId);
      
      // Remove all socket listeners
      socket.off('room-joined');
      socket.off('player-count');
      socket.off('all users');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
      socket.off('room-error');
      
      // Remove game event listeners
      socket.off('game:state');
      socket.off('game:started');
      socket.off('game:role');
      socket.off('game:new-round');
      socket.off('game:guess-result');
      socket.off('game:round-end');
      socket.off('game:ended');
      socket.off('game:emoji');
      socket.off('game:error');
      
      // Clean up media streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close all peer connections
      Object.values(peersRef.current).forEach(peer => {
        peer.close();
      });
      peersRef.current = {};
    };
  }, [roomId, navigate, username]);

  // Set up video stream
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }).catch(error => {
      console.error('Error accessing media devices:', error);
      alert('Failed to access camera and microphone. Please allow access and try again.');
    });
  }, []);
  
  // Game-related event handlers
  function handleGameState(state) {
    setPlayers(state.players);
    
    if (state.gameStarted !== undefined) {
      setGameStarted(state.gameStarted);
    }
    
    if (state.round !== undefined) {
      setCurrentRound(state.round);
    }
    
    if (state.maxRounds !== undefined) {
      setMaxRounds(state.maxRounds);
    }
    
    if (state.scores !== undefined) {
      setScores(state.scores);
    }
  }
  
  function handleGameStarted(data) {
    setGameStarted(true);
    setCurrentRound(data.round);
    setMaxRounds(data.maxRounds);
    setRoundEnded(false);
    setRevealRoles(false);
  }
  
  function handleRoleAssignment(data) {
    setPlayerRole(data.role);
  }
  
  function handleNewRound(data) {
    setCurrentRound(data.round);
    setRoundEnded(false);
    setRevealRoles(false);
  }
  
  function handleGuessResult(result) {
    setRevealRoles(true);
    setScores(result.scores);
  }
  
  function handleRoundEnd() {
    setRoundEnded(true);
  }
  
  function handleGameEnd(data) {
    setGameOver(true);
    setWinners(data.winners);
    setScores(data.scores);
  }
  
  function handleEmojiReceived(data) {
    const { senderId, emoji } = data;
    setPlayerEmojis(prev => ({ ...prev, [senderId]: emoji }));
    
    // Clear emoji after a delay
    setTimeout(() => {
      setPlayerEmojis(prev => {
        const newEmojis = { ...prev };
        delete newEmojis[senderId];
        return newEmojis;
      });
    }, 3000);
  }
  
  function handlePlayerClick(playerId) {
    if (playerRole === 'Police' && !roundEnded) {
      const confirmed = window.confirm(`Do you think User ${playerId.substring(0, 6)} is the Thief?`);
      if (confirmed) {
        socket.emit('game:guess', { roomId, suspectId: playerId });
      }
    }
  }

  // WebRTC functions
  function callUser(userId) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[userId] = peer;

    localStreamRef.current.getTracks().forEach(track => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.ontrack = event => {
      setRemoteStreams(prev => [
        ...prev.filter(s => s.id !== userId), // prevent duplicates
        { id: userId, stream: event.streams[0] }
      ]);
    };

    peer.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate
        });
      }
    };

    peer.createOffer().then(offer => {
      peer.setLocalDescription(offer);
      socket.emit('offer', {
        target: userId,
        callerId: socket.id,
        sdp: offer
      });
    }).catch(err => {
      console.error("Error creating offer:", err);
    });
  }

  function handleReceiveOffer({ callerId, sdp }) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[callerId] = peer;

    localStreamRef.current.getTracks().forEach(track => {
      peer.addTrack(track, localStreamRef.current);
    });

    peer.ontrack = event => {
      setRemoteStreams(prev => [
        ...prev.filter(s => s.id !== callerId),
        { id: callerId, stream: event.streams[0] }
      ]);
    };

    peer.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: callerId,
          candidate: event.candidate
        });
      }
    };

    peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
      return peer.createAnswer();
    }).then(answer => {
      peer.setLocalDescription(answer);
      socket.emit('answer', {
        target: callerId,
        sdp: answer
      });
    }).catch(err => {
      console.error("Error handling offer:", err);
    });
  }

  function handleAnswer({ callerId, sdp }) {
    const peer = peersRef.current[callerId];
    if (peer) {
      peer.setRemoteDescription(new RTCSessionDescription(sdp)).catch(err => {
        console.error("Error setting remote description:", err);
      });
    }
  }

  function handleNewICECandidate({ target, candidate }) {
    const peer = peersRef.current[target];
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
        console.error("Error adding ICE candidate:", err);
      });
    }
  }

  function handleUserDisconnected(userId) {
    const peer = peersRef.current[userId];
    if (peer) {
      peer.close();
      delete peersRef.current[userId];
    }
    setRemoteStreams(prev => prev.filter(s => s.id !== userId));
  }
  
  // Find player names for remote streams
  const getPlayerName = (socketId) => {
    const player = players.find(p => p.socketId === socketId);
    return player?.username || `Player ${socketId.substring(0, 6)}`;
  };
  
  // Get player roles if they should be revealed
  const getPlayerRole = (socketId) => {
    // No roles revealed during the game unless round ended
    if (roundEnded || gameOver) {
      return null; // The server will send role info when needed
    }
    return null;
  };
  
  // Get revealed roles for end of round
  const getRevealedRole = (socketId) => {
    // This would be populated from the server's guess result
    // For now, we'll return null as the real data will come from the server
    return null;
  };
  
  // Determine grid layout based on number of players
  const getVideoGridLayout = (playerCount) => {
    switch (playerCount) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 md:grid-cols-2';
      case 5:
        return 'grid-cols-2 md:grid-cols-3';
      default:
        return 'grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Room: {roomId}</h1>
      </div>

      {/* Game UI */}
      <GameUI
        socket={socket}
        roomId={roomId}
        isGameStarted={gameStarted}
        round={currentRound}
        maxRounds={maxRounds}
        playerRole={playerRole}
        isRoundEnded={roundEnded}
        scores={scores}
        username={username}
        players={players}
      />
      
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">
                {winners.length > 1 ? 'Winners' : 'Winner'}
              </h3>
              {winners.map(winner => (
                <div key={winner.socketId} className="text-lg">
                  {winner.username} - {winner.score} points
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/Home')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Video Grid - Responsive layout based on number of players */}
      <div className={`mt-6 grid ${getVideoGridLayout(remoteStreams.length + 1)} gap-4 justify-items-center`}>
        {/* Local Video - Always shown first and highlighted */}
        <div className="relative col-span-1 row-span-1 w-full h-full">
          <PlayerVideo
            stream={localStreamRef.current ? new MediaStream(localStreamRef.current.getTracks()) : null}
            username={`${username} (You)`}
            id={socket.id}
            isLocal={true}
            role={playerRole}
            showRole={true} // Always show your own role
            emoji={playerEmojis[socket.id]}
          />
          {playerRole && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold py-1 px-2 rounded-full">
              Your Role: {playerRole}
            </div>
          )}
        </div>

        {/* Remote Videos - With clear labeling and interactive elements */}
        {remoteStreams.map(({ id, stream }) => (
          <div 
            key={id} 
            className={`relative col-span-1 row-span-1 w-full h-full ${playerRole === 'Police' && !roundEnded ? 'cursor-pointer transform hover:scale-105 transition-transform duration-200' : ''}`}
            onClick={() => playerRole === 'Police' && !roundEnded ? handlePlayerClick(id) : null}
          >
            <PlayerVideo
              stream={stream}
              username={getPlayerName(id)}
              id={id}
              isLocal={false}
              role={getPlayerRole(id)}
              showRole={revealRoles}
              emoji={playerEmojis[id]}
            />
            {playerRole === 'Police' && !roundEnded && (
              <div className="absolute bottom-12 left-0 right-0 bg-blue-600 bg-opacity-70 text-white text-center py-1 text-xs font-bold">
                Click to guess this player
              </div>
            )}
            {revealRoles && roundEnded && getRevealedRole(id) && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-full">
                {getRevealedRole(id)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Game Instructions Modal */}
      <GameInstructions />
    </div>
  );
}

export default Room;