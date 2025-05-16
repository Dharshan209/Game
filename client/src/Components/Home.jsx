import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function Home() {
  const [user, setUser] = useState({});
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user data in localStorage
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
      
      setIsLoading(false);
      // Add a small delay to let the server set up the room fully
      setTimeout(() => {
        navigate(`/room/${newRoomId}`);
      }, 500);
    });

    socket.on("room-joined", (validRoomId) => {
      console.log("Joined room:", validRoomId);
      setIsLoading(false);
      navigate(`/room/${validRoomId}`);
    });

    socket.on("room-error", (errorMsg) => {
      setIsLoading(false);
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 5000); // Clear error after 5 seconds
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
    setIsLoading(true);
    setErrorMessage("");
    socket.emit("create-room");
    console.log("Create Room clicked");
  };

  const handleJoin = () => {
    if (!roomId || roomId.trim() === "") {
      setErrorMessage("Please enter a valid Room ID");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    socket.emit("join room", roomId.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-xl border border-blue-100">
        {/* Header with user info and logout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.username || user?.name || "Guest"}!
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm9 7a1 1 0 11-2 0V6a1 1 0 112 0v4zm0 2a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>

        {/* User profile info card */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Player Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <p><span className="font-semibold">Name:</span> {user?.name || 'N/A'}</p>
            <p><span className="font-semibold">Email:</span> {user?.email || 'N/A'}</p>
            <p><span className="font-semibold">Phone:</span> {user?.phone || 'N/A'}</p>
            <p><span className="font-semibold">High Score:</span> {user?.high_score ?? 0}</p>
          </div>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 relative">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        {/* Room controls */}
        <div className="space-y-6">
          <div className="text-center">
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg transition flex items-center justify-center
                ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Room...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Room
                </>
              )}
            </button>
          </div>

          <div className="text-center relative">
            <div className="flex items-center border-t border-gray-200 pt-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-600">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <button
              onClick={handleJoin}
              disabled={isLoading}
              className={`w-full sm:w-auto mt-2 sm:mt-0 bg-green-600 text-white px-6 py-3 rounded-lg transition flex items-center justify-center
                ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'hover:bg-green-700'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Join Room
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Game Room App
      </div>
    </div>
  );
}

export default Home;