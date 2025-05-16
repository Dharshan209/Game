import { useRef, useEffect, useState } from 'react';

function PlayerVideo({ 
  stream, 
  username, 
  id, 
  isLocal = false, 
  role = null, 
  showRole = false, 
  isPolice = false, 
  onPlayerClick = null,
  emoji = null
}) {
  const videoRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  useEffect(() => {
    if (emoji) {
      setShowEmoji(true);
      const timer = setTimeout(() => {
        setShowEmoji(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [emoji]);
  
  const handleClick = () => {
    if (isPolice && onPlayerClick && !isLocal) {
      onPlayerClick(id);
    }
  };
  
  const handleVideoPlay = () => {
    setVideoLoaded(true);
  };
  
  const getPlayerBorderColor = () => {
    if (isLocal) return 'ring-4 ring-blue-500 shadow-lg shadow-blue-200';
    if (isPolice && !isLocal) return 'ring-4 ring-red-300 hover:ring-red-500 cursor-pointer shadow-lg hover:shadow-red-200 transition-all';
    return 'ring-2 ring-gray-300 hover:ring-gray-400';
  };
  
  const getRoleBadgeColor = () => {
    switch (role) {
      case 'King': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'Queen': return 'bg-gradient-to-r from-purple-500 to-fuchsia-600';
      case 'Police': return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'Thief': return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'Minister': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-600';
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center">
      <div 
        className={`relative rounded-xl overflow-hidden ${getPlayerBorderColor()} transition-all duration-300 transform ${isPolice && !isLocal ? 'hover:scale-102' : ''} w-full h-56 md:h-64`}
        onClick={handleClick}
      >
        {/* Loading state */}
        {!videoLoaded && stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-pulse flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">Loading video...</span>
            </div>
          </div>
        )}
        
        {/* No stream state */}
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="flex flex-col items-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 8l4-4m0 0l-4-4m4 4H7m6 4v8m-6-8a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span className="text-sm text-gray-300">Connecting...</span>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
          onPlaying={handleVideoPlay}
        />
        
        {/* Username overlay with gradient background */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent bg-opacity-70 text-white px-3 py-2 flex items-center">
          {isLocal && (
            <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          )}
          <span className="font-medium truncate">
            {username || `User: ${id.substring(0, 6)}`}
          </span>
        </div>
        
        {/* Role badge - only shown if role is revealed */}
        {role && showRole && (
          <div className={`absolute top-2 right-2 ${getRoleBadgeColor()} text-white text-xs font-bold py-1 px-3 rounded-full shadow-md`}>
            {role}
          </div>
        )}
        
        {/* Highlight for police targets */}
        {isPolice && !isLocal && (
          <div className="absolute inset-0 border-2 border-dashed border-red-400 rounded-xl opacity-50 pointer-events-none"></div>
        )}
        
        {/* Emoji reaction */}
        {showEmoji && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl animate-bounce z-20 filter drop-shadow-lg">
            {emoji}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerVideo;