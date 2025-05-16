import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import socket from '../utils/socket';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function Room() {
  const { roomId } = useParams();
  const [playerCount, setPlayerCount] = useState(1);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);

  // Join Room
  useEffect(() => {
    socket.emit('join room', roomId);

    socket.on('player-count', (count) => {
      setPlayerCount(count);
    });

    socket.on('all users', (users) => {
      if (users.length > 0) {
        callUser(users[0]);
      }
    });

    socket.on('offer', handleReceiveOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleNewICECandidate);

    return () => {
      socket.emit('leave room', roomId);
      socket.off('player-count');
      socket.off('all users');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [roomId]);

  // Get local media
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });
  }, []);

  function callUser(userId) {
    peerRef.current = new RTCPeerConnection(ICE_SERVERS);

    // Add our local tracks
    localStreamRef.current.getTracks().forEach(track => {
      peerRef.current.addTrack(track, localStreamRef.current);
    });

    // Handle remote stream
    peerRef.current.ontrack = event => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Handle ICE
    peerRef.current.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate
        });
      }
    };

    peerRef.current.createOffer().then(offer => {
      peerRef.current.setLocalDescription(offer);
      socket.emit('offer', {
        target: userId,
        callerId: socket.id,
        sdp: offer
      });
    });
  }

  function handleReceiveOffer({ callerId, sdp }) {
    peerRef.current = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current.getTracks().forEach(track => {
      peerRef.current.addTrack(track, localStreamRef.current);
    });

    peerRef.current.ontrack = event => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerRef.current.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: callerId,
          candidate: event.candidate
        });
      }
    };

    peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
      return peerRef.current.createAnswer();
    }).then(answer => {
      peerRef.current.setLocalDescription(answer);
      socket.emit('answer', {
        target: callerId,
        sdp: answer
      });
    });
  }

  function handleAnswer({ sdp }) {
    peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  function handleNewICECandidate({ candidate }) {
    peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Room ID: {roomId}</h1>
      <p className="text-lg mt-2">{playerCount} player(s) in the room</p>

      <div className="mt-10 flex flex-col items-center gap-6">
        <div>
          <h2 className="font-semibold">Your Camera</h2>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-96 border" />
        </div>
        <div>
          <h2 className="font-semibold">Remote User</h2>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-96 border" />
        </div>
      </div>
    </div>
  );
}

export default Room;
