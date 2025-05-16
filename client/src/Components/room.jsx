import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import socket from '../utils/socket';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function Room() {
  const { roomId } = useParams();
  const [playerCount, setPlayerCount] = useState(1);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // key: socketId, value: RTCPeerConnection

  useEffect(() => {
    socket.emit('join room', roomId);

    socket.on('player-count', (count) => {
      setPlayerCount(count);
    });

    socket.on('all users', (users) => {
      users.forEach(userId => {
        callUser(userId);
      });
    });

    socket.on('offer', handleReceiveOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleNewICECandidate);
    socket.on('user-disconnected', handleUserDisconnected);

    return () => {
      socket.emit('leave room', roomId);
      socket.off('player-count');
      socket.off('all users');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
    };
  }, [roomId]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });
  }, []);

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
    });
  }

  function handleAnswer({ callerId, sdp }) {
    const peer = peersRef.current[callerId];
    if (peer) {
      peer.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  }

  function handleNewICECandidate({ target, candidate }) {
    const peer = peersRef.current[target];
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
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

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Room ID: {roomId}</h1>
      <p className="text-lg mt-2">{playerCount} player(s) in the room</p>

      <div className="mt-10 grid grid-cols-2 gap-6 justify-center">
        <div>
          <h2 className="font-semibold mb-2">Your Camera</h2>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-96 border" />
        </div>

        {remoteStreams.map(({ id, stream }) => (
          <div key={id}>
            <h2 className="font-semibold mb-2">User: {id}</h2>
            <video
              autoPlay
              playsInline
              className="w-96 border"
              ref={video => {
                if (video) video.srcObject = stream;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Room;
