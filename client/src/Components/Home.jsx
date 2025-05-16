import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function Home() {
  const [user, setUser] = useState({});
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      setUser(JSON.parse(storedData));
    } else {
      // If no user data, redirect to login
      navigate('/');
    }

    // Set up socket event handlers
    socket.on("room-created", (newRoomId) => {
      console.log("Room created with ID:", newRoomId);
      
      // Store the room ID in localStorage so we can handle page refreshes
      localStorage.setItem('lastRoomId', newRoomId);
      
      // Add a small delay to let the server set up the room fully
      setTimeout(() => {
        navigate(`/room/${newRoomId}`);
      }, 500);
    });

    socket.on("room-joined", (validRoomId) => {
      console.log("Joined room:", validRoomId);
      navigate(`/room/${validRoomId}`);
    });

    socket.on("room-error", (errorMsg) => {
      alert(`Error: ${errorMsg}`);
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off("room-created");
      socket.off("room-joined");
      socket.off("room-error");
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/');
  };

  const handleCreateRoom = () => {
    socket.emit("create-room");
    console.log("Create Room clicked");
  };

  const handleJoin = () => {
    if (!roomId || roomId.trim() === "") {
      alert("Please enter a valid Room ID");
      return;
    }

    socket.emit("join room", roomId.trim());
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.username || "Guest"}!
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="space-y-2 text-gray-700">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Phone:</span> {user.phone || 'N/A'}</p>
          <p><span className="font-semibold">High Score:</span> {user.high_score ?? 0}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleCreateRoom}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Room
          </button>

          <div className="mt-6 text-center">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="border px-4 py-2 rounded-lg mr-2"
            />
            <button
              onClick={handleJoin}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
