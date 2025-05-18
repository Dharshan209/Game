import { useEffect, useRef } from 'react';

// WebRTC configuration with STUN/TURN servers
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for reliable connections behind NATs and firewalls
    {
      urls: 'turn:numb.viagenie.ca',
      username: 'webrtc@live.com',
      credential: 'muazkh'
    },
    {
      urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
      username: 'webrtc',
      credential: 'webrtc'
    }
  ],
  iceCandidatePoolSize: 10,
  // Enable ICE Trickle to establish connections faster
  iceTransportPolicy: 'all',
  // Set bundle policy to reduce overhead
  bundlePolicy: 'max-bundle',
  // Set RTCP MUX policy for better performance
  rtcpMuxPolicy: 'require'
};

const WebRTCConnection = ({ 
  socket, 
  roomId, 
  localStreamRef, 
  onRemoteStreamUpdate, 
  onConnectionStatus, 
  username 
}) => {
  // Refs
  const hasJoinedRef = useRef(false);
  const hasSetupGameRef = useRef(false);
  const peersRef = useRef({});
  const connectionCheckIntervalRef = useRef(null);
  
  // Join room and set up socket listeners
  useEffect(() => {
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
      onConnectionStatus({ isConnectionIssue: false });
      
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
    
    function handleAllUsers(users) {
      console.log('Received all users in room:', users);
      users.forEach(userId => {
        // Check if we already have a connection to this user
        if (!peersRef.current[userId]) {
          console.log(`Initiating connection to user: ${userId}`);
          callUser(userId);
        } else {
          console.log(`Already connected to user: ${userId}`);
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
    
    // WebRTC events
    socket.on('room-joined', handleRoomJoined);
    socket.on('all users', handleAllUsers);
    socket.on('user-joined', handleUserJoined); 
    socket.on('offer', handleReceiveOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleNewICECandidate);
    socket.on('user-disconnected', handleUserDisconnected);

    // Set up connection status checker
    connectionCheckIntervalRef.current = setInterval(() => {
      // Check peer connection states
      const activePeers = Object.values(peersRef.current);
      const hasActiveConnections = activePeers.length > 0;
      const allDisconnected = hasActiveConnections && 
        activePeers.every(peer => 
          ['disconnected', 'failed', 'closed'].includes(peer.connectionState || peer.iceConnectionState)
        );
      
      onConnectionStatus({ isConnectionIssue: hasActiveConnections && allDisconnected });
    }, 5000);

    return () => {
      // Leave room
      socket.emit('leave room', roomId);
      
      // Remove all socket listeners
      socket.off('room-joined');
      socket.off('all users');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
      
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
    };
  }, [roomId, socket, onRemoteStreamUpdate, onConnectionStatus, username, localStreamRef]);

  // WebRTC functions
  function callUser(userId) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[userId] = peer;

    // Add connection state monitoring with enhanced logging
    peer.onconnectionstatechange = () => {
      console.log(`Connection state change for peer ${userId}: ${peer.connectionState}`);
      // Monitor for potential reconnection needs
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        console.warn(`Connection to peer ${userId} is ${peer.connectionState}. Consider reconnecting.`);
      }
    };
    
    peer.oniceconnectionstatechange = () => {
      console.log(`ICE connection state change for peer ${userId}: ${peer.iceConnectionState}`);
      
      // Implement ice connection recovery mechanism
      if (peer.iceConnectionState === 'failed') {
        console.warn(`ICE connection failed for peer ${userId}. Attempting recovery...`);
        // Attempt to restart ICE
        peer.restartIce();
      }
    };
    
    peer.onicegatheringstatechange = () => {
      console.log(`ICE gathering state change for peer ${userId}: ${peer.iceGatheringState}`);
    };
    
    peer.onsignalingstatechange = () => {
      console.log(`Signaling state change for peer ${userId}: ${peer.signalingState}`);
    };

    // Setup bandwidth estimation and monitoring
    if ('sctp' in peer) {
      // Set max message size for data channels
      peer.sctp.maxMessageSize = 262144; // 256 KiB
    }

    // Add tracks with content hints for better encoding decisions
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        const sender = peer.addTrack(track, localStreamRef.current);
        
        // Apply bandwidth limits if supported
        if (sender && 'setParameters' in sender && RTCRtpSender.getCapabilities) {
          const params = sender.getParameters();
          if (!params.encodings) {
            params.encodings = [{}];
          }
          
          // Set encoding parameters for video tracks
          if (track.kind === 'video') {
            // Limit bandwidth based on track type
            params.encodings[0].maxBitrate = 800000; // 800 kbps for video
            params.encodings[0].scaleResolutionDownBy = 1.0; // Start with no downscaling
            
            // Implement adaptive bitrate
            sender.setParameters(params).catch(e => console.error('Failed to set sender parameters:', e));
          }
          
          // Set encoding parameters for audio tracks
          if (track.kind === 'audio') {
            params.encodings[0].maxBitrate = 32000; // 32 kbps for audio
            sender.setParameters(params).catch(e => console.error('Failed to set sender parameters:', e));
          }
        }
      });
    }

    peer.ontrack = event => {
      console.log(`Track received from peer ${userId}`, event.streams);
      
      // Optimize incoming tracks
      event.streams[0].getTracks().forEach(track => {
        // Set content hints if applicable
        if (track.kind === 'video' && 'contentHint' in track) {
          track.contentHint = 'motion';
        }
      });
      
      onRemoteStreamUpdate(prev => [
        ...prev.filter(s => s.id !== userId), // prevent duplicates
        { id: userId, stream: event.streams[0] }
      ]);
    };

    // Monitor connection quality and congestion
    let statsInterval;
    if ('getStats' in peer) {
      statsInterval = setInterval(() => {
        peer.getStats().then(stats => {
          let videoPacketsLost = 0;
          let videoPacketsReceived = 0;
          let videoBytesReceived = 0;
          let videoFramesDecoded = 0;
          let videoFramesDropped = 0;
          
          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              videoPacketsLost = report.packetsLost || 0;
              videoPacketsReceived = report.packetsReceived || 0;
              videoBytesReceived = report.bytesReceived || 0;
              
              // Calculate packet loss rate
              const lossRate = videoPacketsReceived > 0 ? 
                (videoPacketsLost / (videoPacketsLost + videoPacketsReceived)) * 100 : 0;
              
              // If loss rate is high, adjust video quality
              if (lossRate > 5 && peer.connectionState === 'connected') {
                // Find video sender to adjust quality
                peer.getSenders().forEach(sender => {
                  if (sender.track && sender.track.kind === 'video') {
                    const params = sender.getParameters();
                    if (params.encodings && params.encodings.length > 0) {
                      // Increase downscaling if loss rate is high
                      if (lossRate > 10) {
                        params.encodings[0].scaleResolutionDownBy = 2.0; // More aggressive scaling
                        params.encodings[0].maxBitrate = 500000; // Lower bitrate
                      } else if (lossRate > 5) {
                        params.encodings[0].scaleResolutionDownBy = 1.5; // Moderate scaling
                        params.encodings[0].maxBitrate = 650000; // Reduced bitrate
                      }
                      sender.setParameters(params).catch(e => 
                        console.error('Failed to adjust sender parameters:', e));
                    }
                  }
                });
              }
            }
            
            if (report.type === 'media-source' && report.kind === 'video') {
              videoFramesDecoded = report.framesDecoded || 0;
              videoFramesDropped = report.framesDropped || 0;
            }
          });
        }).catch(e => console.error('Error getting stats:', e));
      }, 5000); // Check every 5 seconds
    }

    peer.onicecandidate = event => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to peer ${userId}`, event.candidate);
        socket.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate
        });
      }
    };
    
    // Handle cleanup when connection is closed
    const cleanupConnection = () => {
      if (statsInterval) {
        clearInterval(statsInterval);
      }
    };
    
    // Attach cleanup to connection state change
    const originalStateHandler = peer.onconnectionstatechange;
    peer.onconnectionstatechange = () => {
      if (originalStateHandler) originalStateHandler();
      if (peer.connectionState === 'closed') {
        cleanupConnection();
      }
    };

    // Create offer with optimized SDP
    const offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      voiceActivityDetection: true,
      iceRestart: true
    };
    
    peer.createOffer(offerOptions).then(offer => {
      // Optimize SDP for low-bandwidth environments
      let sdp = offer.sdp;
      
      // Prioritize VP8 codec for better compatibility
      sdp = preferCodec(sdp, 'video', 'VP8');
      
      // Set new SDP with our modifications
      const modifiedOffer = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
      });
      
      return peer.setLocalDescription(modifiedOffer)
        .then(() => {
          socket.emit('offer', {
            target: userId,
            callerId: socket.id,
            sdp: modifiedOffer
          });
        });
    }).catch(err => {
      console.error("Error creating offer:", err);
    });
  }

  function handleReceiveOffer({ callerId, sdp }) {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[callerId] = peer;
    
    // Add connection state monitoring with recovery mechanisms
    peer.onconnectionstatechange = () => {
      console.log(`Connection state change for peer ${callerId}: ${peer.connectionState}`);
      // Monitor for potential reconnection needs
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        console.warn(`Connection to peer ${callerId} is ${peer.connectionState}. Consider reconnecting.`);
      }
    };
    
    peer.oniceconnectionstatechange = () => {
      console.log(`ICE connection state change for peer ${callerId}: ${peer.iceConnectionState}`);
      
      // Implement ice connection recovery mechanism
      if (peer.iceConnectionState === 'failed') {
        console.warn(`ICE connection failed for peer ${callerId}. Attempting recovery...`);
        // Attempt to restart ICE
        peer.restartIce();
      }
    };
    
    peer.onicegatheringstatechange = () => {
      console.log(`ICE gathering state change for peer ${callerId}: ${peer.iceGatheringState}`);
    };
    
    peer.onsignalingstatechange = () => {
      console.log(`Signaling state change for peer ${callerId}: ${peer.signalingState}`);
    };

    // Setup bandwidth estimation and monitoring
    if ('sctp' in peer) {
      // Set max message size for data channels
      peer.sctp.maxMessageSize = 262144; // 256 KiB
    }

    // Add tracks with content hints for better encoding decisions
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        const sender = peer.addTrack(track, localStreamRef.current);
        
        // Apply bandwidth limits if supported
        if (sender && 'setParameters' in sender && RTCRtpSender.getCapabilities) {
          const params = sender.getParameters();
          if (!params.encodings) {
            params.encodings = [{}];
          }
          
          // Set encoding parameters for video tracks
          if (track.kind === 'video') {
            // Limit bandwidth based on track type
            params.encodings[0].maxBitrate = 800000; // 800 kbps for video
            params.encodings[0].scaleResolutionDownBy = 1.0; // Start with no downscaling
            
            // Implement adaptive bitrate
            sender.setParameters(params).catch(e => console.error('Failed to set sender parameters:', e));
          }
          
          // Set encoding parameters for audio tracks
          if (track.kind === 'audio') {
            params.encodings[0].maxBitrate = 32000; // 32 kbps for audio
            sender.setParameters(params).catch(e => console.error('Failed to set sender parameters:', e));
          }
        }
      });
    }

    peer.ontrack = event => {
      console.log(`Track received from peer ${callerId}`, event.streams);
      
      // Optimize incoming tracks
      event.streams[0].getTracks().forEach(track => {
        // Set content hints if applicable
        if (track.kind === 'video' && 'contentHint' in track) {
          track.contentHint = 'motion';
        }
      });
      
      onRemoteStreamUpdate(prev => [
        ...prev.filter(s => s.id !== callerId),
        { id: callerId, stream: event.streams[0] }
      ]);
    };
    
    // Monitor connection quality and congestion
    let statsInterval;
    if ('getStats' in peer) {
      statsInterval = setInterval(() => {
        peer.getStats().then(stats => {
          let videoPacketsLost = 0;
          let videoPacketsReceived = 0;
          let videoBytesReceived = 0;
          let videoFramesDecoded = 0;
          let videoFramesDropped = 0;
          
          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              videoPacketsLost = report.packetsLost || 0;
              videoPacketsReceived = report.packetsReceived || 0;
              videoBytesReceived = report.bytesReceived || 0;
              
              // Calculate packet loss rate
              const lossRate = videoPacketsReceived > 0 ? 
                (videoPacketsLost / (videoPacketsLost + videoPacketsReceived)) * 100 : 0;
              
              // If loss rate is high, adjust video quality
              if (lossRate > 5 && peer.connectionState === 'connected') {
                // Find video sender to adjust quality
                peer.getSenders().forEach(sender => {
                  if (sender.track && sender.track.kind === 'video') {
                    const params = sender.getParameters();
                    if (params.encodings && params.encodings.length > 0) {
                      // Increase downscaling if loss rate is high
                      if (lossRate > 10) {
                        params.encodings[0].scaleResolutionDownBy = 2.0; // More aggressive scaling
                        params.encodings[0].maxBitrate = 500000; // Lower bitrate
                      } else if (lossRate > 5) {
                        params.encodings[0].scaleResolutionDownBy = 1.5; // Moderate scaling
                        params.encodings[0].maxBitrate = 650000; // Reduced bitrate
                      }
                      sender.setParameters(params).catch(e => 
                        console.error('Failed to adjust sender parameters:', e));
                    }
                  }
                });
              }
            }
            
            if (report.type === 'media-source' && report.kind === 'video') {
              videoFramesDecoded = report.framesDecoded || 0;
              videoFramesDropped = report.framesDropped || 0;
            }
          });
        }).catch(e => console.error('Error getting stats:', e));
      }, 5000); // Check every 5 seconds
    }

    peer.onicecandidate = event => {
      if (event.candidate) {
        console.log(`Sending ICE candidate to peer ${callerId}`, event.candidate);
        socket.emit('ice-candidate', {
          target: callerId,
          candidate: event.candidate
        });
      }
    };
    
    // Handle cleanup when connection is closed
    const cleanupConnection = () => {
      if (statsInterval) {
        clearInterval(statsInterval);
      }
    };
    
    // Attach cleanup to connection state change
    const originalStateHandler = peer.onconnectionstatechange;
    peer.onconnectionstatechange = () => {
      if (originalStateHandler) originalStateHandler();
      if (peer.connectionState === 'closed') {
        cleanupConnection();
      }
    };

    // Optimize the received SDP for better performance
    let optimizedSdp = sdp;
    optimizedSdp.sdp = preferCodec(optimizedSdp.sdp, 'video', 'VP8');
    
    peer.setRemoteDescription(new RTCSessionDescription(optimizedSdp)).then(() => {
      // Create answer with additional options
      const answerOptions = {
        voiceActivityDetection: true
      };
      return peer.createAnswer(answerOptions);
    }).then(answer => {
      // Optimize the answer SDP
      let sdp = answer.sdp;
      // Prioritize VP8 codec for better compatibility
      sdp = preferCodec(sdp, 'video', 'VP8');
      
      const modifiedAnswer = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp
      });
      
      return peer.setLocalDescription(modifiedAnswer)
        .then(() => {
          socket.emit('answer', {
            target: callerId,
            sdp: modifiedAnswer
          });
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
    onRemoteStreamUpdate(prev => {
      const filteredStreams = prev.filter(s => s.id !== userId);
      console.log(`Removed stream for user ${userId}, remaining streams: ${filteredStreams.length}`);
      return filteredStreams;
    });
  }

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
    onConnectionStatus({ isConnectionIssue: false });
    
    // Restart media with potentially lower quality settings
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      
      // Try with lower resolution and framerate
      const fallbackConstraints = {
        video: {
          width: { ideal: 320, max: 640 },
          height: { ideal: 180, max: 360 },
          frameRate: { ideal: 10, max: 15 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        }
      };
      
      navigator.mediaDevices.getUserMedia(fallbackConstraints)
        .then(stream => {
          localStreamRef.current = stream;
          onConnectionStatus({ isLocalVideoLoaded: true });
          
          // Attempt to join room again
          socket.emit('join room', roomId);
          hasJoinedRef.current = true;
        })
        .catch(error => {
          console.error('Error accessing media devices during reconnect:', error);
          // Try audio only as a last resort
          navigator.mediaDevices.getUserMedia({ audio: fallbackConstraints.audio })
            .then(audioStream => {
              localStreamRef.current = audioStream;
              onConnectionStatus({ 
                isLocalVideoLoaded: true, 
                mediaError: "Video unavailable. Reconnected with audio-only."
              });
              
              // Attempt to join room with audio only
              socket.emit('join room', roomId);
              hasJoinedRef.current = true;
            })
            .catch(() => {
              // Last resort - join without media
              socket.emit('join room', roomId);
              hasJoinedRef.current = true;
            });
        });
    } else {
      // Attempt to join room again
      socket.emit('join room', roomId);
      hasJoinedRef.current = true;
    }
  };

  // Helper function to prefer a specific codec in SDP
  function preferCodec(sdp, type, codecName) {
    const lines = sdp.split('\r\n');
    const mLineIndex = lines.findIndex(line => 
      line.startsWith('m=' + type) && line.includes('UDP/TLS/RTP/SAVPF'));
    
    if (mLineIndex === -1) {
      return sdp;
    }
    
    // Find PT for codec
    let codecPt = null;
    const rtpmapPattern = new RegExp('a=rtpmap:(\\d+) ' + codecName + '/\\d+');
    
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(rtpmapPattern);
      if (match) {
        codecPt = match[1];
        break;
      }
    }
    
    if (codecPt === null) {
      return sdp; // Codec not found
    }
    
    // Modify the m-line to prefer the codec
    const parts = lines[mLineIndex].split(' ');
    const formats = parts.slice(3);
    const formatIndex = formats.indexOf(codecPt);
    
    if (formatIndex !== -1) {
      formats.splice(formatIndex, 1);
      formats.unshift(codecPt);
      parts.splice(3, parts.length - 3, ...formats);
      lines[mLineIndex] = parts.join(' ');
    }
    
    return lines.join('\r\n');
  }

  return {
    handleReconnect
  };
};

export default WebRTCConnection;