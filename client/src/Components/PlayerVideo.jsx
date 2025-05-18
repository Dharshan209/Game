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
  emoji = null,
  connectionQuality = 'good' // Track connection quality for adaptive UI
}) {
  const videoRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioActive, setAudioActive] = useState(false);
  const [isMuted, setIsMuted] = useState(isLocal); // Always start muted if local
  const [videoQuality, setVideoQuality] = useState('auto'); // auto, low, medium, high
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Set up the video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Add srcObject change error handling
      videoRef.current.onerror = (error) => {
        console.error('Video element error:', error);
        // Reset srcObject to handle potential errors
        setTimeout(() => {
          if (videoRef.current && stream && stream.active) {
            videoRef.current.srcObject = null;
            videoRef.current.srcObject = stream;
          }
        }, 1000);
      };
    }
    
    // Set up audio visualization if not local (since local is muted)
    if (stream && !isLocal) {
      try {
        // Create audio context and analyzer
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 32;
        
        // Create source from stream
        const audioSource = audioContextRef.current.createMediaStreamSource(stream);
        audioSource.connect(analyserRef.current);
        
        // Set up data array for analyzer
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        // Start audio visualization
        startAudioVisualization();
      } catch (err) {
        console.error('Error setting up audio visualization:', err);
      }
    }
    
    // Cleanup function to properly handle stream when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Clean up audio context
      if (audioContextRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        audioContextRef.current.close().catch(err => {
          console.error('Error closing audio context:', err);
        });
      }
    };
  }, [stream, isLocal]);
  
  // Audio visualization function
  const startAudioVisualization = () => {
    const updateAudioLevel = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average audio level
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      
      const avg = sum / dataArrayRef.current.length;
      setAudioLevel(avg / 255); // Normalize to 0-1
      
      // Determine if audio is active
      setAudioActive(avg > 15); // Threshold for activity
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  };
  
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

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!isLocal && videoRef.current) {
      const video = videoRef.current;
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };
  
  const toggleVideo = (e) => {
    e.stopPropagation();
    if (videoRef.current && stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const track = videoTracks[0];
        track.enabled = !track.enabled;
        setIsVideoDisabled(!track.enabled);
      }
    }
  };
  
  const toggleFullScreen = (e) => {
    e.stopPropagation();
    const videoContainer = videoRef.current?.parentElement;
    
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };
  
  // Detect when exiting fullscreen via ESC key
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);
  
  // Get role styling
  const getRoleGradient = (role) => {
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
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${isPolice && !isLocal ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Border styling that varies based on player type */}
      <div 
        className={`absolute inset-0 rounded-xl ${
          isLocal 
            ? 'ring-2 ring-primary-500/80 shadow-glow-primary' 
            : isPolice && !isLocal 
              ? 'ring-2 ring-danger-500/50 hover:ring-danger-500 shadow-md hover:shadow-glow-accent transition-all duration-300' 
              : 'ring-1 ring-white/20'
        } z-10 pointer-events-none`}
      ></div>
      
      {/* Video state indicator (loading, no stream) */}
      {!stream && (
        <div className="absolute inset-0 bg-gradient-to-br from-dark-blue to-dark-purple z-20 flex items-center justify-center rounded-xl overflow-hidden">
          <div className="flex flex-col items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-white font-medium">Connecting...</span>
            <span className="mt-2 text-xs text-primary-300">Waiting for {isLocal ? 'your' : 'player'} camera</span>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {!videoLoaded && stream && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-secondary-900/80 z-20 flex items-center justify-center rounded-xl overflow-hidden backdrop-blur-md">
          <div className="animate-pulse flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-primary-300 font-medium">Loading video...</span>
          </div>
        </div>
      )}
      
      {/* Video Disabled indicator */}
      {isVideoDisabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/90 to-dark-blue/90 z-20 flex items-center justify-center rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span className="text-sm text-white font-medium">Camera Off</span>
          </div>
        </div>
      )}
      
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className="w-full h-full object-cover bg-black rounded-xl"
        onPlaying={handleVideoPlay}
        onLoadedMetadata={e => {
          // Attempt to play the video as soon as metadata is loaded
          const playPromise = e.target.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('Auto-play was prevented:', error);
              // Try again with user interaction emulation after a short delay
              setTimeout(() => {
                if (videoRef.current) {
                  const newPlayAttempt = videoRef.current.play();
                  if (newPlayAttempt !== undefined) {
                    newPlayAttempt.catch(err => {
                      console.warn('Retry auto-play failed:', err);
                    });
                  }
                }
              }, 1000);
            });
          }
        }}
        // Low latency hints
        onWaiting={() => console.log('Video buffering...')} 
        onStalled={() => console.log('Video stalled...')}
      />
      
      {/* Username overlay with gradient background */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 flex items-center z-30">
        {/* Connection recovery button for poor connections */}
        {!isLocal && connectionQuality === 'poor' && (
          <button 
            onClick={() => {
              if (videoRef.current && stream) {
                // Temporary fix to attempt to recover connection
                videoRef.current.srcObject = null;
                setTimeout(() => {
                  if (videoRef.current && stream) {
                    videoRef.current.srcObject = stream;
                  }
                }, 1000);
              }
            }}
            className="mr-2 text-xs bg-danger-600/80 hover:bg-danger-600 px-1.5 py-0.5 rounded-md transition-colors"
            title="Try to fix video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        {/* Local or speaking indicator */}
        {(isLocal || (audioActive && !isLocal)) && (
          <span 
            className={`h-2 w-2 rounded-full ${isLocal ? 'bg-primary-500' : 'bg-success-500'} mr-2 ${audioActive && !isLocal ? 'animate-pulse' : ''}`} 
            aria-label={isLocal ? "You" : "Speaking"}
          ></span>
        )}
        
        {/* Username display */}
        <span className="font-medium text-white truncate">
          {username || `User: ${id.substring(0, 6)}`}
        </span>
        
        {/* Muted indicator */}
        {isMuted && !isLocal && (
          <span className="ml-auto bg-danger-600/80 text-white text-xs p-1 rounded-md" title="Muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
      
      {/* Role badge - only shown if role is revealed */}
      {role && showRole && (
        <div 
          className="absolute top-2 right-2 text-white text-xs font-bold py-1 px-3 rounded-full shadow-md backdrop-blur-sm z-30"
          style={{ background: getRoleGradient(role) }}
        >
          {role}
        </div>
      )}
      
      {/* Highlight for police targets */}
      {isPolice && !isLocal && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="absolute inset-0 border-2 border-dashed border-danger-400/50 rounded-xl"></div>
          <div className="bg-danger-900/70 backdrop-blur-sm text-white text-xs py-1.5 px-3 rounded-full shadow-lg transform transition-transform hover:scale-110">
            Click to guess
          </div>
        </div>
      )}
      
      {/* Audio level visualizer */}
      {!isLocal && videoLoaded && !isMuted && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent overflow-hidden z-40">
          <div 
            className={`h-full transition-all duration-100 ${audioActive ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              width: `${audioLevel * 100}%`,
              background: 'linear-gradient(to right, #49c886, #4b83f7)'
            }}
          ></div>
        </div>
      )}
      
      {/* Emoji reaction */}
      {showEmoji && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl filter drop-shadow-lg z-40" aria-label={`Emoji reaction: ${emoji}`}>
          <div className="animate-bounce-slow">
            {emoji}
          </div>
        </div>
      )}
      
      {/* Video controls - hover activated for non-local videos */}
      {stream && (
        <div className="absolute top-2 left-2 flex space-x-1 opacity-0 hover:opacity-100 z-40 transition-opacity duration-200">
          {!isLocal && (
            <button 
              onClick={toggleMute}
              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition backdrop-blur-sm"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
          
          {isLocal && (
            <button 
              onClick={toggleVideo}
              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition backdrop-blur-sm"
              aria-label={isVideoDisabled ? "Enable Camera" : "Disable Camera"}
            >
              {isVideoDisabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              )}
            </button>
          )}
          
          {/* Video Quality Selector for local streams */}
          {isLocal && (
            <div className="relative">
              <button 
                onClick={() => setVideoQuality(videoQuality === 'auto' ? 'low' : videoQuality === 'low' ? 'medium' : videoQuality === 'medium' ? 'high' : 'auto')}
                className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition backdrop-blur-sm"
                aria-label="Video Quality"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-black/70 text-white px-2 py-1 rounded whitespace-nowrap">
                {videoQuality === 'auto' ? 'Auto' : videoQuality === 'low' ? 'Low' : videoQuality === 'medium' ? 'Medium' : 'High'}
              </span>
            </div>
          )}
          
          <button 
            onClick={toggleFullScreen}
            className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition backdrop-blur-sm"
            aria-label={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v4a1 1 0 01-1 1H2a1 1 0 010-2h.5a.5.5 0 00.5-.5V5a1 1 0 00-1-1H2a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V6a1 1 0 012 0v4a1 1 0 01-1 1H2a1 1 0 100 2h1a1 1 0 011 1v1.5a.5.5 0 00.5.5H5a1 1 0 000-2h-.5a.5.5 0 01-.5-.5V13a1 1 0 00-1-1H2a1 1 0 01-1-1V9a1 1 0 011-1h1a1 1 0 001-1v-.5A1.5 1.5 0 005.5 6H9a1 1 0 000-2H5zm14 8a1 1 0 00-1 1v.5a.5.5 0 01-.5.5H16a1 1 0 000 2h.5a.5.5 0 00.5-.5V15a1 1 0 00-1-1H13a1 1 0 100 2h1a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-1a1 1 0 01-1-1v-1a1 1 0 10-2 0v1a1 1 0 01-1 1h-3a1 1 0 110-2h3a1 1 0 001-1V7a1 1 0 00-1-1h-4a1 1 0 00-1 1v3a1 1 0 01-1 1h-1a1 1 0 100 2h1a1 1 0 011 1v3a1 1 0 102 0v-3a1 1 0 011-1h3a1 1 0 100-2h-3a1 1 0 01-1-1V6a1 1 0 112 0v1a1 1 0 001 1h1a1 1 0 100-2h-1a1 1 0 01-1-1V4a1 1 0 10-2 0v1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      )}
      
      {/* Connection quality indicator */}
      {!isLocal && (
        <div className="absolute top-2 right-2 z-40">
          {connectionQuality === 'poor' && (
            <div className="bg-danger-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Poor
            </div>
          )}
          {connectionQuality === 'medium' && (
            <div className="bg-warning-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Fair
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlayerVideo;