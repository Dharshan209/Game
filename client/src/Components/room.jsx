import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import socket from '../utils/socket';
import PlayerVideo from './PlayerVideo';
import GameUI from './GameUI';
import GameInstructions from './GameInstructions';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
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
  const [revealedRoles, setRevealedRoles] = useState({});
  const [guessResult, setGuessResult] = useState(null);
  const [isConnectionIssue, setIsConnectionIssue] = useState(false);
  const [isLocalVideoLoaded, setIsLocalVideoLoaded] = useState(false);
  const [isRequestingMedia, setIsRequestingMedia] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  
  // Refs
  const errorHandledRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const hasSetupGameRef = useRef(false);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // key: socketId, value: RTCPeerConnection
  const connectionCheckIntervalRef = useRef(null);
  const reconnectionIntervalRef = useRef(null);

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
    
    // Periodically check if we need to reconnect to any peers
    const reconnectionIntervalRef = useRef(null);
    reconnectionIntervalRef.current = setInterval(() => {
      if (remoteStreams.length < players.length - 1 && players.length > 1) {
        console.log('Missing some peer connections, reconnecting...');
        socket.emit('room:get-users', roomId);
      }
    }, 5000);
    
    // Setup event handlers
    
    // Room events
    function handleRoomJoined(joinedRoomId) {
      console.log(`Successfully joined room: ${joinedRoomId}`);
      setIsConnectionIssue(false);
      
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
      console.log('Received all users in room:', users);
      users.forEach(userId => {
        // Skip self
        if (userId === socket.id) return;
        
        // Check if we already have a connection to this user
        if (!peersRef.current[userId]) {
          console.log(`Initiating connection to user: ${userId}`);
          callUser(userId);
        } else {
          // Check if the connection is still good
          const peer = peersRef.current[userId];
          if (['disconnected', 'failed', 'closed'].includes(peer.connectionState || peer.iceConnectionState)) {
            console.log(`Connection to ${userId} is in state ${peer.connectionState || peer.iceConnectionState}, reconnecting...`);
            // Close old peer
            peer.close();
            delete peersRef.current[userId];
            // Remove from remote streams if exists
            setRemoteStreams(prev => prev.filter(s => s.id !== userId));
            // Create new connection
            callUser(userId);
          } else {
            console.log(`Already connected to user: ${userId}`);
          }
        }
      });
    }
    
    function handleUserJoined(userId) {
      console.log(`New user joined: ${userId}`);
      // When a new user joins, initiate a connection to them
      if (!peersRef.current[userId]) {
        console.log(`Initiating connection to new user: ${userId}`);
        callUser(userId);
      }
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
    socket.on('user-joined', handleUserJoined); 
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

    // Set up connection status checker
    connectionCheckIntervalRef.current = setInterval(() => {
      // Check peer connection states
      const activePeers = Object.values(peersRef.current);
      const hasActiveConnections = activePeers.length > 0;
      const allDisconnected = hasActiveConnections && 
        activePeers.every(peer => 
          ['disconnected', 'failed', 'closed'].includes(peer.connectionState || peer.iceConnectionState)
        );
      
      if (hasActiveConnections && allDisconnected) {
        setIsConnectionIssue(true);
      } else {
        setIsConnectionIssue(false);
      }
    }, 5000);

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

      // Clear intervals
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current);
      }
      if (reconnectionIntervalRef.current) {
        clearInterval(reconnectionIntervalRef.current);
      }
    };
  }, [roomId, navigate, username]);

  // Set up video stream
  useEffect(() => {
    setIsRequestingMedia(true);
    setMediaError(null);
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsLocalVideoLoaded(true);
        setIsRequestingMedia(false);
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
        setMediaError(error.message || "Failed to access camera and microphone");
        setIsRequestingMedia(false);
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
      const suspectName = getPlayerName(playerId);
      const confirmed = window.confirm(`Do you think ${suspectName} is the Thief?`);
      if (confirmed) {
        socket.emit('game:guess', { roomId, suspectId: playerId });
      }
    }
  }

  // WebRTC functions
  function callUser(userId) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[userId] = peer;

    // Add connection state monitoring
    peer.onconnectionstatechange = () => {
      console.log(`Connection state change for peer ${userId}: ${peer.connectionState}`);
    };
    
    peer.oniceconnectionstatechange = () => {
      console.log(`ICE connection state change for peer ${userId}: ${peer.iceConnectionState}`);
    };
    
    peer.onicegatheringstatechange = () => {
      console.log(`ICE gathering state change for peer ${userId}: ${peer.iceGatheringState}`);
    };
    
    peer.onsignalingstatechange = () => {
      console.log(`Signaling state change for peer ${userId}: ${peer.signalingState}`);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    peer.ontrack = event => {
      console.log(`Track received from peer ${userId}`, event.streams);
      setRemoteStreams(prev => [
        ...prev.filter(s => s.id !== userId), // prevent duplicates
        { id: userId, stream: event.streams[0] }
      ]);
    };

    peer.onicecandidate = event => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to peer ${userId}`, event.candidate);
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
    
    // Add connection state monitoring
    peer.onconnectionstatechange = () => {
      console.log(`Connection state change for peer ${callerId}: ${peer.connectionState}`);
    };
    
    peer.oniceconnectionstatechange = () => {
      console.log(`ICE connection state change for peer ${callerId}: ${peer.iceConnectionState}`);
    };
    
    peer.onicegatheringstatechange = () => {
      console.log(`ICE gathering state change for peer ${callerId}: ${peer.iceGatheringState}`);
    };
    
    peer.onsignalingstatechange = () => {
      console.log(`Signaling state change for peer ${callerId}: ${peer.signalingState}`);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    peer.ontrack = event => {
      console.log(`Track received from peer ${callerId}`, event.streams);
      setRemoteStreams(prev => [
        ...prev.filter(s => s.id !== callerId),
        { id: callerId, stream: event.streams[0] }
      ]);
    };

    peer.onicecandidate = event => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to peer ${callerId}`, event.candidate);
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
      console.log(`Received ICE candidate for peer ${target}`, candidate);
      
      // Only add ICE candidate if we have a remote description
      if (peer.remoteDescription && peer.remoteDescription.type) {
        peer.addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => {
            console.log(`Successfully added ICE candidate for peer ${target}`);
          })
          .catch(err => {
            console.error(`Error adding ICE candidate for peer ${target}:`, err);
          });
      } else {
        console.warn(`Skipping ICE candidate as remote description not set for peer ${target}`);
      }
    } else {
      console.error(`Received ICE candidate for unknown peer ${target}`);
    }
  }

  function handleUserDisconnected(userId) {
    console.log(`User disconnected: ${userId}`);
    const peer = peersRef.current[userId];
    if (peer) {
      console.log(`Closing peer connection to ${userId}`);
      peer.close();
      delete peersRef.current[userId];
    }
    
    // Remove user's stream from state
    setRemoteStreams(prev => {
      const filteredStreams = prev.filter(s => s.id !== userId);
      console.log(`Removed stream for user ${userId}, remaining streams: ${filteredStreams.length}`);
      return filteredStreams;
    });
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

  // Fixed grid layout with 3 videos per row on desktop
  const getVideoGridLayout = () => {
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  };

  // Handle room sharing
  const handleShareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my GameVerse room!',
        text: `Join me in GameVerse room: ${roomId}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Room link copied to clipboard!'))
        .catch(err => console.error('Could not copy link:', err));
    }
  };

  // Handle rejoining room if connection issues
  const handleReconnect = () => {
    // Clean up existing connections
    Object.values(peersRef.current).forEach(peer => {
      peer.close();
    });
    peersRef.current = {};
    
    // Reset state
    hasJoinedRef.current = false;
    hasSetupGameRef.current = false;
    setIsConnectionIssue(false);
    
    // Attempt to join room again
    socket.emit('join room', roomId);
    hasJoinedRef.current = true;
  };

  return (
    <div className="min-h-screen bg-primary-gradient bg-fixed overflow-x-hidden relative text-white">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }}>
      </div>

      {/* Connection issue notification */}
      {isConnectionIssue && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-danger-600/90 backdrop-blur-md text-white p-4 flex items-center shadow-xl rounded-lg max-w-md border border-danger-500/50 animate-slide-in-up">
          <div className="mr-3 flex-shrink-0">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold">Connection issues detected!</p>
            <p className="text-sm">Try reconnecting to restore your connections.</p>
          </div>
          <button 
            onClick={handleReconnect}
            className="ml-auto bg-white text-danger-600 text-sm font-bold py-1.5 px-4 rounded-full hover:bg-white/90 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Media error notification */}
      {mediaError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-danger-600/90 backdrop-blur-md text-white p-4 flex items-center shadow-xl rounded-lg max-w-md border border-danger-500/50 animate-slide-in-up">
          <div className="mr-3 flex-shrink-0">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Camera/Microphone Error</p>
            <p className="text-sm">{mediaError}. Please check your permissions.</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-5 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg mb-6 border border-white/20">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-blue-purple-gradient text-white font-bold text-lg sm:text-xl px-4 py-2 rounded-xl shadow-glow-primary">
              Room: {roomId}
            </div>
            <button 
              onClick={handleShareRoom}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all border border-white/10 flex items-center"
              aria-label="Share room"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </button>
            <button 
              onClick={() => setIsInstructionsOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all border border-white/10 hidden md:flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              How to Play
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-secondary-600/20 text-white font-semibold px-3 py-1.5 rounded-full flex items-center border border-secondary-500/30">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" aria-hidden="true"></span>
              <span>{players.length} Player{players.length !== 1 ? 's' : ''} Online</span>
            </div>
            <button 
              onClick={() => navigate('/Home')}
              className="bg-danger-600/80 hover:bg-danger-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center shadow-md hover:shadow-glow-accent"
              aria-label="Leave room"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 9a1 1 0 11-2 0V8.414l-2.293 2.293a1 1 0 11-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 8.414V12z" clipRule="evenodd" />
              </svg>
              Exit
            </button>
          </div>
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
        
        {/* Video Grid Container */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-5 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video Feeds
          </h2>
          
          {/* Role Banner - only shown during game */}
          {playerRole && gameStarted && (
            <div className={`mb-5 p-4 rounded-xl ${getRoleBannerClasses(playerRole)} flex flex-col md:flex-row md:items-center md:justify-between`}>
              <div className="flex items-center mb-2 md:mb-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md" 
                     style={{background: getRoleGradient(playerRole)}}>
                  {getRoleIcon(playerRole)}
                </div>
                <div>
                  <span className="font-bold text-lg block md:inline-block md:mr-2">Your Role: {playerRole}</span>
                  <span className="text-sm opacity-90">{getRoleDescription(playerRole)}</span>
                </div>
              </div>
              <div className="md:ml-4">
                {getRoleAction(playerRole, roundEnded)}
              </div>
            </div>
          )}
          
          {/* Media loading state */}
          {isRequestingMedia && !isLocalVideoLoaded && (
            <div className="p-5 rounded-xl bg-primary-600/20 border border-primary-500/30 mb-5 flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Requesting camera and microphone access...</span>
            </div>
          )}
          
          {/* Responsive Video Grid */}
          <div className={`grid ${getVideoGridLayout(remoteStreams.length + 1)} gap-5`}>
            {/* Create an array with local video first, followed by all remote videos */}
            {[{
              id: socket.id,
              stream: localStreamRef.current ? new MediaStream(localStreamRef.current.getTracks()) : null,
              isLocal: true,
              username: `${username} (You)`,
              role: playerRole,
              showRole: true
            }, ...remoteStreams.map(({ id, stream }) => ({
              id,
              stream,
              isLocal: false,
              username: getPlayerName(id),
              role: getPlayerRole(id),
              showRole: revealRoles
            }))].map(({ id, stream, isLocal, username, role, showRole }) => (
              <div 
                key={id} 
                className={`relative h-[200px] sm:h-[220px] md:h-[260px] lg:h-[300px] aspect-video ${!isLocal && playerRole === 'Police' && !roundEnded ? 'cursor-pointer transform hover:scale-102 transition-transform duration-200' : ''}`}
                onClick={() => !isLocal && playerRole === 'Police' && !roundEnded ? handlePlayerClick(id) : null}
              >
                <PlayerVideo
                  stream={stream}
                  username={username}
                  id={id}
                  isLocal={isLocal}
                  role={isLocal ? role : getPlayerRole(id)}
                  showRole={isLocal || revealRoles}
                  emoji={playerEmojis[id]}
                  isPolice={!isLocal && playerRole === 'Police' && !roundEnded}
                  onPlayerClick={!isLocal ? handlePlayerClick : null}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl w-full max-w-lg text-center shadow-xl animate-scale-in">
              <div className="bg-blue-purple-gradient text-white py-4 px-6 rounded-xl -mt-10 mb-6 shadow-glow-primary mx-auto w-fit">
                <h2 className="text-2xl font-bold font-display">Game Over!</h2>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-5 text-white">
                  {winners.length > 1 ? 'Winners' : 'Winner'}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {winners.map(winner => (
                    <div key={winner.socketId} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                      <div className="flex items-center justify-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-blue-purple-gradient flex items-center justify-center shadow-glow-primary mr-2">
                          {winner.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-bold text-lg text-white">
                          {winner.username}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary-300">
                        {winner.score} points
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/Home')}
                  className="bg-blue-purple-gradient hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-glow-primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Return Home
                </button>
                <button
                  onClick={handleShareRoom}
                  className="bg-purple-pink-gradient hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-glow-secondary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share Results
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Game Instructions Modal */}
        {isInstructionsOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl w-full max-w-4xl shadow-xl animate-scale-in m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white font-display flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-secondary-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  How to Play GameVerse
                </h2>
                <button 
                  onClick={() => setIsInstructionsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Close instructions"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4 font-display">Game Overview</h3>
                  <p className="text-white/80 mb-4">
                    GameVerse is a social deduction game where players take on different roles and must use 
                    observation, deduction, and sometimes deception to achieve their goals. Each role has its 
                    own unique objective, creating a dynamic and engaging multiplayer experience.
                  </p>
                  <p className="text-white/80">
                    The game is played in rounds, with each round offering a new chance for the Police to identify 
                    the Thief. Use the video chat to observe other players, their behaviors, and try to deduce who's 
                    who based on their actions.
                  </p>
                </div>
                
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4 font-display">How a Round Works</h3>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Each player is assigned a random role</li>
                    <li>Players interact via video chat to observe each other</li>
                    <li>The Police tries to identify who the Thief is</li>
                    <li>The Police can make one guess per round</li>
                    <li>If correct, the Police earns points</li>
                    <li>If incorrect, the Thief earns points</li>
                    <li>After each round, roles may be reassigned</li>
                    <li>After all rounds, the player with the most points wins</li>
                  </ol>
                </div>
                
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4 font-display">Roles & Objectives</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm" style={{background: 'linear-gradient(to right, #f29e05, #fbba15)'}}>👑</span>
                      <div>
                        <span className="text-white font-medium block">King</span>
                        <p className="text-white/70 text-sm">Act royal, but don't be too obvious! You want to stay hidden from the Thief while maintaining your royal status.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm" style={{background: 'linear-gradient(to right, #6e42ea, #9c87fa)'}}>👸</span>
                      <div>
                        <span className="text-white font-medium block">Queen</span>
                        <p className="text-white/70 text-sm">Protect the King's identity while observing others for suspicious behavior.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm" style={{background: 'linear-gradient(to right, #2e61ea, #4b83f7)'}}>🕵️</span>
                      <div>
                        <span className="text-white font-medium block">Police</span>
                        <p className="text-white/70 text-sm">Your job is to identify the Thief through careful observation of player behavior.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm" style={{background: 'linear-gradient(to right, #e11a31, #ff6b78)'}}>🦹</span>
                      <div>
                        <span className="text-white font-medium block">Thief</span>
                        <p className="text-white/70 text-sm">Avoid detection by blending in and acting natural. Your goal is to remain unidentified.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm" style={{background: 'linear-gradient(to right, #188c56, #49c886)'}}>🧙</span>
                      <div>
                        <span className="text-white font-medium block">Minister</span>
                        <p className="text-white/70 text-sm">Assist in royal court matters while helping to identify suspicious behavior.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4 font-display">Tips & Strategies</h3>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Use the chat to communicate, but be careful what you reveal</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Watch for unusual behaviors or nervous reactions</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Pay attention to how people react to others' statements</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>As the Police, don't reveal your suspicions until you're ready to guess</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Use emojis to communicate emotions or reactions without words</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Sometimes, misdirection can be a powerful strategy</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setIsInstructionsOpen(false)}
                  className="bg-blue-purple-gradient hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-glow-primary"
                >
                  Let's Play!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get role banner classes
function getRoleBannerClasses(role) {
  switch (role) {
    case 'King':
      return 'bg-gradient-to-r from-warning-600/20 to-warning-600/10 border border-warning-500/30';
    case 'Queen':
      return 'bg-gradient-to-r from-secondary-600/20 to-secondary-600/10 border border-secondary-500/30';
    case 'Police':
      return 'bg-gradient-to-r from-primary-600/20 to-primary-600/10 border border-primary-500/30';
    case 'Thief':
      return 'bg-gradient-to-r from-danger-600/20 to-danger-600/10 border border-danger-500/30';
    case 'Minister':
      return 'bg-gradient-to-r from-success-600/20 to-success-600/10 border border-success-500/30';
    default:
      return 'bg-gradient-to-r from-neutral-600/20 to-neutral-600/10 border border-neutral-500/30';
  }
}

// Helper function to get role gradient background
function getRoleGradient(role) {
  switch (role) {
    case 'King':
      return 'linear-gradient(to right, #f29e05, #fbba15)';
    case 'Queen':
      return 'linear-gradient(to right, #6e42ea, #9c87fa)';
    case 'Police':
      return 'linear-gradient(to right, #2e61ea, #4b83f7)';
    case 'Thief':
      return 'linear-gradient(to right, #e11a31, #ff6b78)';
    case 'Minister':
      return 'linear-gradient(to right, #188c56, #49c886)';
    default:
      return 'linear-gradient(to right, #6c7c8e, #8696a7)';
  }
}

// Helper function to get role description
function getRoleDescription(role) {
  switch (role) {
    case 'King':
      return "Protected by others. Act royal but don't be too obvious!";
    case 'Queen':
      return "Help protect the King's identity and observe others.";
    case 'Police':
      return "Find and catch the Thief through observation.";
    case 'Thief':
      return "Try to avoid being caught by blending in with others.";
    case 'Minister':
      return "Help protect the royal court while observing others.";
    default:
      return "Role description unavailable.";
  }
}

// Helper function to get role-specific action text
function getRoleAction(role, roundEnded) {
  if (roundEnded) return null;
  
  switch (role) {
    case 'Police':
      return (
        <span className="text-sm bg-primary-600/20 px-3 py-1.5 rounded-full inline-flex items-center border border-primary-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Click on a player to identify the Thief
        </span>
      );
    case 'Thief':
      return (
        <span className="text-sm bg-danger-600/20 px-3 py-1.5 rounded-full inline-flex items-center border border-danger-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
          Act natural to avoid detection!
        </span>
      );
    default:
      return (
        <span className="text-sm bg-white/10 px-3 py-1.5 rounded-full inline-flex items-center border border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
          Observe others and interact via chat
        </span>
      );
  }
}

// Helper function to get role icon
function getRoleIcon(role) {
  switch (role) {
    case 'King':
      return '👑';
    case 'Queen':
      return '👸';
    case 'Police':
      return '🕵️';
    case 'Thief':
      return '🦹';
    case 'Minister':
      return '🧙';
    default:
      return '❓';
  }
}

export default Room;