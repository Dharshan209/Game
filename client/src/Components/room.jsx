import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import socket from '../utils/socket';
import PlayerVideo from './PlayerVideo';
import GameUI from './GameUI';
import GameInstructions from './GameInstructions';
import WebRTCConnection from './WebRTCConnection';
import VideoGrid from './VideoGrid';
import ConnectionStatus from './ConnectionStatus';
import { RoleBanner } from './RoleUtils';

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
  const [isConnectionIssue, setIsConnectionIssue] = useState(false);
  const [isLocalVideoLoaded, setIsLocalVideoLoaded] = useState(false);
  const [isRequestingMedia, setIsRequestingMedia] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  
  // Refs
  const errorHandledRef = useRef(false);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const webRTCRef = useRef(null);

  // Check for authentication
  useEffect(() => {
    if (!localStorage.getItem('user')) {
      navigate('/');
    }
  }, [navigate]);

  // Set up video stream with optimized constraints
  useEffect(() => {
    setIsRequestingMedia(true);
    setMediaError(null);
    
    // Define constraints optimized for performance
    const mediaConstraints = {
      video: {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 360, max: 720 },
        frameRate: { ideal: 15, max: 24 },
        facingMode: 'user',
        // Add bandwidth and quality constraints
        contentHint: 'motion',
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 22050, // Lower sampleRate to save bandwidth
      }
    };
    
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then(stream => {
        // Apply bandwidth limitations to tracks
        stream.getVideoTracks().forEach(track => {
          if ('contentHint' in track) {
            track.contentHint = 'motion'; // Optimize for motion vs detail
          }
        });
        
        // Store stream reference
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
        
        // Fallback to audio-only if video fails
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError' || 
            error.name === 'NotReadableError' || error.name === 'OverconstrainedError') {
          // Try audio only
          navigator.mediaDevices.getUserMedia({ audio: mediaConstraints.audio })
            .then(audioStream => {
              localStreamRef.current = audioStream;
              setIsLocalVideoLoaded(true);
              setIsRequestingMedia(false);
              setMediaError("Video unavailable. Audio-only mode activated.");
            })
            .catch(audioError => {
              console.error('Error accessing audio devices:', audioError);
              setMediaError("Failed to access audio and video.");
              setIsRequestingMedia(false);
            });
        }
      });
  }, []);
  
  // Game-related event handlers
  useEffect(() => {
    // Game Events
    socket.on('game:state', handleGameState);
    socket.on('game:started', handleGameStarted);
    socket.on('game:role', handleRoleAssignment);
    socket.on('game:new-round', handleNewRound);
    socket.on('game:guess-result', handleGuessResult);
    socket.on('game:round-end', handleRoundEnd);
    socket.on('game:ended', handleGameEnd);
    socket.on('game:emoji', handleEmojiReceived);
    socket.on('room-error', handleRoomError);
    socket.on('player-count', handlePlayerCount);

    return () => {
      // Remove game event listeners
      socket.off('game:state');
      socket.off('game:started');
      socket.off('game:role');
      socket.off('game:new-round');
      socket.off('game:guess-result');
      socket.off('game:round-end');
      socket.off('game:ended');
      socket.off('game:emoji');
      socket.off('room-error');
      socket.off('player-count');
    };
  }, []);

  function handlePlayerCount(count) {
    setPlayerCount(count);
  }

  function handleRoomError(msg) {
    console.error(`Room error: ${msg}`);
    if (!errorHandledRef.current) {
      errorHandledRef.current = true;
      alert(`Error: ${msg}`);
      navigate('/Home');
    }
  }
  
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

  // Find player names for remote streams
  const getPlayerName = (socketId) => {
    const player = players.find(p => p.socketId === socketId);
    return player?.username || `Player ${socketId.substring(0, 6)}`;
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

  // Handle connection status updates
  const handleConnectionStatus = (status) => {
    if (status.isConnectionIssue !== undefined) {
      setIsConnectionIssue(status.isConnectionIssue);
    }
    if (status.isLocalVideoLoaded !== undefined) {
      setIsLocalVideoLoaded(status.isLocalVideoLoaded);
    }
    if (status.mediaError !== undefined) {
      setMediaError(status.mediaError);
    }
  };

  const handleReconnect = () => {
    if (webRTCRef.current) {
      webRTCRef.current.handleReconnect();
    }
  };

  return (
    <div className="min-h-screen bg-primary-gradient bg-fixed overflow-x-hidden relative text-white">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }}>
      </div>

      {/* WebRTC Connection Management */}
      {webRTCRef.current = WebRTCConnection({
        socket,
        roomId,
        localStreamRef,
        onRemoteStreamUpdate: setRemoteStreams,
        onConnectionStatus: handleConnectionStatus,
        username
      })}

      {/* Connection Status Notifications */}
      <ConnectionStatus
        isConnectionIssue={isConnectionIssue}
        mediaError={mediaError}
        isRequestingMedia={isRequestingMedia}
        isLocalVideoLoaded={isLocalVideoLoaded}
        onReconnect={handleReconnect}
      />

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
            <RoleBanner role={playerRole} roundEnded={roundEnded} />
          )}
          
          {/* Responsive Video Grid */}
          <VideoGrid 
            remoteStreams={remoteStreams}
            localStreamRef={localStreamRef}
            localUsername={username}
            socket={socket}
            playerRole={playerRole}
            revealRoles={revealRoles}
            roundEnded={roundEnded}
            players={players}
            playerEmojis={playerEmojis}
            onPlayerClick={handlePlayerClick}
          />
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
          <GameInstructions onClose={() => setIsInstructionsOpen(false)} />
        )}
      </div>
    </div>
  );
}

export default Room;