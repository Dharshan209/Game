import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function Home() {
  // State
  const [user, setUser] = useState({});
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const navigate = useNavigate();

  useEffect(() => {
    // Animation on page load
    setTimeout(() => setIsAnimating(false), 800);
    
    // Check for user data in localStorage
    const storedData = localStorage.getItem("user");
    if (storedData) {
      setUser(JSON.parse(storedData));
      
      // Get recent rooms from local storage
      const stored = localStorage.getItem("recentRooms");
      if (stored) {
        try {
          const parsedRooms = JSON.parse(stored);
          setRecentRooms(Array.isArray(parsedRooms) ? parsedRooms.slice(0, 5) : []);
        } catch (e) {
          console.error("Failed to parse recent rooms:", e);
        }
      }
    } else {
      // If no user data, redirect to login
      navigate('/');
    }

    // Set up socket event handlers
    socket.on("room-created", (newRoomId) => {
      console.log("Room created with ID:", newRoomId);
      
      // Store the room ID in localStorage so we can handle page refreshes
      localStorage.setItem('lastRoomId', newRoomId);
      
      // Save to recent rooms
      saveToRecentRooms(newRoomId);
      
      setIsLoading(false);
      // Add a small delay to let the server set up the room fully
      setTimeout(() => {
        navigate(`/room/${newRoomId}`);
      }, 500);
    });

    socket.on("room-joined", (validRoomId) => {
      console.log("Joined room:", validRoomId);
      // Save to recent rooms
      saveToRecentRooms(validRoomId);
      
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
  
  const saveToRecentRooms = (roomId) => {
    const stored = localStorage.getItem("recentRooms");
    let rooms = [];
    if (stored) {
      try {
        rooms = JSON.parse(stored);
        if (!Array.isArray(rooms)) rooms = [];
      } catch (e) {
        rooms = [];
      }
    }
    
    // Add the new room at the beginning and remove duplicates
    rooms = [roomId, ...rooms.filter(id => id !== roomId)].slice(0, 5);
    localStorage.setItem("recentRooms", JSON.stringify(rooms));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/');
  };

  const handleCreateRoom = () => {
    setIsLoading(true);
    setErrorMessage("");
    socket.emit("create-room");
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
  
  const joinRecentRoom = (id) => {
    setIsLoading(true);
    setErrorMessage("");
    socket.emit("join room", id);
  };

  return (
    <div className="min-h-screen bg-primary-gradient bg-fixed overflow-x-hidden relative">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-secondary-600/10 to-transparent"></div>
      <div className="absolute inset-0 opacity-5 mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }}>
      </div>

      {/* Header with user info and logout */}
      <header className="w-full px-6 py-4 flex justify-between items-center backdrop-blur-md bg-dark-blue/50 border-b border-white/10 z-20 relative">
        <div className="flex items-center gap-4">
          <div className="text-2xl md:text-3xl font-bold font-display text-transparent bg-clip-text bg-blue-purple-gradient">
            GameVerse
          </div>
          <div className="hidden md:block px-3 py-1 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-300 text-xs">
            BETA
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-white/5 rounded-full pl-2 pr-4 py-1 border border-white/10">
            <div className="h-8 w-8 rounded-full bg-blue-purple-gradient flex items-center justify-center text-white font-bold mr-2 shadow-glow-primary">
              {user?.username?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "G"}
            </div>
            <span className="text-white">{user?.username || user?.name || "Guest"}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-danger-600/90 hover:bg-danger-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-glow-accent"
            aria-label="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 9a1 1 0 11-2 0V8.414l-2.293 2.293a1 1 0 11-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 8.414V12z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 relative z-10">
        {/* Hero Section */}
        <div className={`text-center mb-12 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} transition-all duration-1000 ease-out`}>
          <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-4 tracking-tight leading-tight">
            Welcome to GameVerse
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            The ultimate social deduction game where strategy, deception, and keen observation collide.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-md animate-slide-in-up">
            <div className="bg-danger-600/90 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-xl mx-4 border border-danger-500/50 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto mb-16">
          {/* Game Card */}
          <div className={`bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-700 ease-out delay-300`}>
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-all ${activeTab === "create" 
                  ? "text-white border-b-2 border-primary-500" 
                  : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                Create Game
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-all ${activeTab === "join" 
                  ? "text-white border-b-2 border-secondary-500" 
                  : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                Join Game
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {activeTab === "create" ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-blue-purple-gradient flex items-center justify-center mb-6 shadow-glow-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-4">Create New Game Room</h2>
                  
                  <p className="text-white/70 text-center mb-8 max-w-md">
                    Create your own game room and invite friends to join you. 
                    You'll be the first player in the room and can wait for others to join.
                  </p>
                  
                  <button
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="w-full max-w-md bg-blue-purple-gradient hover:opacity-90 text-white text-lg font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-glow-primary transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Game...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Create New Game
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-purple-pink-gradient flex items-center justify-center mb-6 shadow-glow-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-4">Join Existing Game</h2>
                  
                  <p className="text-white/70 text-center mb-6 max-w-md">
                    Enter a room ID to join an existing game, or select one of your recent rooms below.
                  </p>
                  
                  <div className="w-full max-w-md mb-6">
                    <label htmlFor="roomId" className="block text-sm font-medium text-white/80 mb-2">Room ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="roomId"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 focus:border-secondary-400 focus:ring focus:ring-secondary-500/50 rounded-lg px-4 py-3 text-white placeholder-white/40 outline-none transition-all"
                      />
                      <button
                        onClick={handleJoin}
                        disabled={isLoading || !roomId.trim()}
                        className="bg-purple-pink-gradient hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-glow-secondary transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recent Rooms Section */}
            {recentRooms.length > 0 && (
              <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-2">
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Recent Rooms
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentRooms.map((roomId, index) => (
                      <button
                        key={index}
                        onClick={() => joinRecentRoom(roomId)}
                        disabled={isLoading}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-3 px-4 rounded-xl flex items-center justify-between transition-all duration-200 group"
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary-400 group-hover:text-secondary-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{roomId}</span>
                        </span>
                        <span className="text-secondary-400 text-sm invisible group-hover:visible">
                          Join →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Game Features */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10 font-display">Game Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 transition-transform hover:transform hover:scale-[1.02] hover:shadow-glow-primary">
              <div className="rounded-2xl bg-blue-purple-gradient w-14 h-14 flex items-center justify-center mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Multiplayer</h3>
              <p className="text-white/70">
                Play with up to 6 friends in high-quality video chat while you deduce who's who in this social game of deception.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 transition-transform hover:transform hover:scale-[1.02] hover:shadow-glow-secondary">
              <div className="rounded-2xl bg-purple-pink-gradient w-14 h-14 flex items-center justify-center mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dynamic Roles</h3>
              <p className="text-white/70">
                Every game is different with unique roles: King, Queen, Police, Thief, and Minister, each with special abilities and objectives.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 transition-transform hover:transform hover:scale-[1.02] hover:shadow-glow-accent">
              <div className="rounded-2xl bg-orange-red-gradient w-14 h-14 flex items-center justify-center mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Interactive Gameplay</h3>
              <p className="text-white/70">
                Chat, share reactions, and use strategic deception to win in this fast-paced game of social deduction and observation.
              </p>
            </div>
          </div>
        </div>
        
        {/* How to Play */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-display flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-secondary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              How to Play
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Roles Overview</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center mr-3 text-xs">👑</span>
                    <div>
                      <span className="text-white font-medium">King</span>
                      <p className="text-white/70 text-sm">Protected by others. Act royal but don't make it too obvious!</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary-600 flex items-center justify-center mr-3 text-xs">👸</span>
                    <div>
                      <span className="text-white font-medium">Queen</span>
                      <p className="text-white/70 text-sm">Protect the King's identity while observing others.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center mr-3 text-xs">🕵️</span>
                    <div>
                      <span className="text-white font-medium">Police</span>
                      <p className="text-white/70 text-sm">Find and catch the Thief through observation.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-danger-600 flex items-center justify-center mr-3 text-xs">🦹</span>
                    <div>
                      <span className="text-white font-medium">Thief</span>
                      <p className="text-white/70 text-sm">Try to avoid being caught by blending in with others.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success-600 flex items-center justify-center mr-3 text-xs">🧙</span>
                    <div>
                      <span className="text-white font-medium">Minister</span>
                      <p className="text-white/70 text-sm">Help protect the royal court while observing others.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Game Rules</h3>
                <ol className="list-decimal list-inside space-y-2 text-white/80">
                  <li>Create or join a game room with 3-6 players</li>
                  <li>Each player is assigned a secret role</li>
                  <li>Use video chat to discuss and observe other players</li>
                  <li>The Police must try to identify the Thief</li>
                  <li>The Thief must avoid detection</li>
                  <li>The King, Queen and Minister must protect the royal identity</li>
                  <li>Each round, the Police gets one guess to catch the Thief</li>
                  <li>Points are awarded based on success or failure</li>
                  <li>After multiple rounds, the player with the most points wins</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-dark-blue/80 backdrop-blur-md py-6 text-center text-white/50 text-sm border-t border-white/5">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} GameVerse | The Ultimate Social Deduction Game</p>
          <div className="mt-2 flex justify-center gap-4">
            <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
