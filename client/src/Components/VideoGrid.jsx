import React from 'react';
import PlayerVideo from './PlayerVideo';

const VideoGrid = ({ 
  remoteStreams, 
  localStreamRef, 
  localUsername, 
  socket, 
  playerRole, 
  revealRoles, 
  roundEnded, 
  players,
  playerEmojis,
  onPlayerClick,
  revealedRoles = {} // Add this prop with a default empty object
}) => {
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

  // Find player names for remote streams
  const getPlayerName = (socketId) => {
    const player = players.find(p => p.socketId === socketId);
    return player?.username || `Player ${socketId.substring(0, 6)}`;
  };
  
  // Get player roles if they should be revealed
  const getPlayerRole = (socketId) => {
    // Use the revealedRoles object to get roles that have been revealed
    if ((roundEnded || revealRoles) && revealedRoles[socketId]) {
      return revealedRoles[socketId];
    }
    return null;
  };

  return (
    <div className={`grid ${getVideoGridLayout(remoteStreams.length + 1)} gap-5`}>
      {/* Local Video - Always shown first and highlighted */}
      <div className="relative h-[260px] md:h-[300px]">
        <PlayerVideo
          stream={localStreamRef.current ? new MediaStream(localStreamRef.current.getTracks()) : null}
          username={`${localUsername} (You)`}
          id={socket.id}
          isLocal={true}
          role={playerRole}
          showRole={true} // Always show your own role
          emoji={playerEmojis[socket.id]}
        />
      </div>

      {/* Remote Videos - With clear labeling and interactive elements */}
      {remoteStreams.map(({ id, stream }) => (
        <div 
          key={id} 
          className={`relative h-[260px] md:h-[300px] ${playerRole === 'Police' && !roundEnded ? 'cursor-pointer transform hover:scale-102 transition-transform duration-200' : ''}`}
          onClick={() => playerRole === 'Police' && !roundEnded ? onPlayerClick(id) : null}
        >
          <PlayerVideo
            stream={stream}
            username={getPlayerName(id)}
            id={id}
            isLocal={false}
            role={getPlayerRole(id)}
            showRole={revealRoles}
            emoji={playerEmojis[id]}
            isPolice={playerRole === 'Police' && !roundEnded}
            onPlayerClick={onPlayerClick}
            connectionQuality={stream ? 'good' : 'poor'} // Basic connection quality indicator
          />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;