import { useState, useEffect, useRef } from 'react';

const EMOJIS = ['👍', '👏', '😊', '😂', '🎮', '🎯', '🕵️', '👑', '🤔', '😮', '❤️', '🎭', '🔍', '👀', '🥸', '😱', '🧠', '🤫', '🤐', '🙄'];

function GameUI({ 
  socket, 
  roomId, 
  isGameStarted, 
  round, 
  maxRounds, 
  playerRole, 
  isRoundEnded, 
  scores = {}, 
  username,
  players = []
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isGameInfoOpen, setIsGameInfoOpen] = useState(false);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Refs
  const chatContainerRef = useRef(null);
  const lastMessageTimeRef = useRef(Date.now());
  
  useEffect(() => {
    socket.on('game:chat', handleChatMessage);
    socket.on('game:guess-result', handleGuessResult);
    socket.on('game:state', handleGameState);
    
    return () => {
      socket.off('game:chat');
      socket.off('game:guess-result');
      socket.off('game:state');
    };
  }, [socket]);
  
  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    
    // If chat is hidden, increment notification count
    if (!showChat && chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage.timestamp > lastMessageTimeRef.current && lastMessage.senderId !== socket.id) {
        setNotificationCount(prev => prev + 1);
      }
    }
    
    // Update last message time
    if (chatMessages.length > 0) {
      lastMessageTimeRef.current = chatMessages[chatMessages.length - 1].timestamp;
    }
  }, [chatMessages, showChat]);
  
  const handleChatMessage = (data) => {
    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }
    setChatMessages(prev => [...prev, data]);
  };
  
  const handleGuessResult = (result) => {
    setGuessResult(result);
  };
  
  const handleGameState = (state) => {
    // If player is already marked as ready in the state
    const playerState = state.players.find(p => p.socketId === socket.id);
    if (playerState?.ready) {
      setIsReady(true);
    }
    
    // Update ready players list
    const ready = state.players.filter(p => p.ready).map(p => p.socketId);
    setReadyPlayers(ready);
  };
  
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    socket.emit('game:chat', { 
      roomId, 
      message: newMessage,
      timestamp: Date.now()
    });
    setNewMessage('');
  };
  
  const sendEmoji = (emoji) => {
    socket.emit('game:emoji', { roomId, emoji });
    setShowEmojis(false);
  };
  
  const markReady = () => {
    socket.emit('game:ready', { roomId });
    setIsReady(true);
  };
  
  const startNextRound = () => {
    socket.emit('game:next-round', { roomId });
    setGuessResult(null);
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get player ready status icon
  const getPlayerReadyStatus = (playerId) => {
    const isPlayerReady = readyPlayers.includes(playerId);
    if (isPlayerReady) {
      return (
        <span className="ml-2 text-success-500" title="Ready">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Game Status Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/20">
        {/* Status Header */}
        <div className="bg-blue-purple-gradient py-4 px-5 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
            <div className="font-bold text-xl flex items-center text-white">
              {isGameStarted ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-warning-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Game in Progress
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-300 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Waiting for Players
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isGameStarted && (
              <div className="bg-white/10 text-white px-4 py-1.5 rounded-full flex items-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-secondary-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Round {round}/{maxRounds}
              </div>
            )}
            
            <button
              onClick={() => setIsGameInfoOpen(!isGameInfoOpen)}
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white p-2 rounded-lg transition-colors"
              aria-label="Game information"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Game Info Panel (collapsible) */}
        {isGameInfoOpen && (
          <div className="p-4 bg-white/5 border-b border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Players
                </h3>
                <div className="bg-white/5 rounded-lg p-3 shadow-sm border border-white/10">
                  <ul className="divide-y divide-white/5">
                    {players.map(player => (
                      <li key={player.socketId} className="py-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${player.socketId === socket.id ? 'bg-primary-500' : 'bg-success-500'} mr-2`}></div>
                          <span className="text-white">{player.username || player.socketId.substring(0, 6)}</span>
                          {player.socketId === socket.id && <span className="ml-1 text-xs text-primary-300">(You)</span>}
                        </div>
                        {!isGameStarted && getPlayerReadyStatus(player.socketId)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Scoreboard
                </h3>
                <div className="bg-white/5 rounded-lg p-3 shadow-sm border border-white/10">
                  {Object.keys(scores).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(scores).map(([playerId, score]) => {
                        const player = players.find(p => p.socketId === playerId);
                        const isCurrentPlayer = playerId === socket.id;
                        return (
                          <div 
                            key={playerId} 
                            className={`p-2 rounded-lg ${isCurrentPlayer ? 'bg-primary-900/30 border border-primary-500/30' : 'bg-white/5 border border-white/10'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate text-sm font-medium text-white">
                                {player?.username || `Player ${playerId.substring(0, 4)}`}
                              </span>
                              <span className="font-bold text-warning-300">{score}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-white/50 py-2">
                      No scores yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Game Action Area */}
        <div className="p-4 md:p-5">
          {/* Ready Button / Round Controls */}
          <div className="flex justify-center mb-5">
            {!isGameStarted && !isReady && (
              <button 
                onClick={markReady}
                className="bg-green-teal-gradient text-white font-bold py-3 px-8 rounded-xl transition transform hover:opacity-90 hover:shadow-glow-success flex items-center space-x-2"
                aria-label="Mark yourself as ready to play"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>I'm Ready to Play!</span>
              </button>
            )}
            
            {!isGameStarted && isReady && (
              <div className="text-center">
                <div className="bg-success-600/20 text-white font-medium px-6 py-3 rounded-xl mb-2 flex items-center border border-success-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-success-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  You're Ready!
                </div>
                <div className="flex items-center justify-center text-sm text-white/70">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Waiting for others: {readyPlayers.length}/{players.length} players ready
                </div>
              </div>
            )}
            
            {isRoundEnded && isGameStarted && (
              <div className="w-full max-w-lg bg-white/5 p-5 rounded-xl shadow-md border border-white/20">
                {guessResult && (
                  <div className="mb-6">
                    <div className={`text-2xl font-bold mb-3 text-center ${guessResult.isCorrect ? 'text-success-400' : 'text-danger-400'}`}>
                      {guessResult.isCorrect 
                        ? '🎉 The Police caught the Thief!' 
                        : '🏃‍♂️ The Thief escaped!'}
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-white/80 border border-white/10">
                      {guessResult.isCorrect
                        ? <div className="text-center">The Police has earned 1 point for catching the Thief!</div>
                        : <div className="text-center">The Thief has earned 1 point for escaping!</div>
                      }
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={startNextRound}
                  className="w-full bg-blue-purple-gradient text-white font-bold py-3 px-8 rounded-xl transition hover:opacity-90 hover:shadow-glow-primary flex items-center justify-center"
                  aria-label="Proceed to next round"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next Round
                </button>
              </div>
            )}
          </div>
          
          {/* Emoji Quick Reactions */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/5 p-2 rounded-full shadow-md border border-white/10 flex space-x-1 overflow-x-auto max-w-full">
              {EMOJIS.slice(0, 8).map(emoji => (
                <button
                  key={emoji}
                  onClick={() => sendEmoji(emoji)}
                  className="text-xl hover:bg-white/10 p-2 rounded-full transition-all transform hover:scale-110 flex-shrink-0"
                  aria-label={`Send ${emoji} emoji`}
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="bg-primary-600/20 hover:bg-primary-600/40 text-white p-2 rounded-full transition-all flex-shrink-0 border border-primary-500/30"
                aria-label="More emojis"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Emoji Panel (expanded) */}
          {showEmojis && (
            <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg border border-white/10 p-4 mb-6 animate-scale-in">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white">Reactions</h3>
                <button 
                  onClick={() => setShowEmojis(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => sendEmoji(emoji)}
                    className="text-2xl hover:bg-white/10 p-2 rounded-lg transition-all transform hover:scale-110"
                    aria-label={`Send ${emoji} emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Tab Control */}
          <div className="flex border-b border-white/10 mb-4">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-4 text-center transition-all ${activeTab === 'chat' 
                ? 'text-white border-b-2 border-primary-500' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                Chat
                {activeTab !== 'chat' && notificationCount > 0 && (
                  <span className="ml-1 bg-danger-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('strategy');
                setNotificationCount(0);
              }}
              className={`flex-1 py-2 px-4 text-center transition-all ${activeTab === 'strategy' 
                ? 'text-white border-b-2 border-secondary-500' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Strategy Notes
              </div>
            </button>
          </div>
          
          {/* Content for active tab */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-white/10">
            {activeTab === 'chat' ? (
              <>
                <div 
                  ref={chatContainerRef}
                  className="h-60 overflow-y-auto p-4 bg-black/20 scroll-smooth"
                  aria-live="polite"
                  aria-label="Chat messages"
                >
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>No messages yet. Start the conversation!</span>
                      <span className="mt-1 text-xs">Chat with other players to deduce roles and strategize.</span>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => {
                      const isCurrentUser = msg.senderId === socket.id;
                      const player = players.find(p => p.socketId === msg.senderId);
                      const senderName = player?.username || msg.username || `Player ${msg.senderId?.substring(0, 4)}`;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`mb-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs rounded-2xl px-4 py-2 shadow-sm ${isCurrentUser 
                              ? 'bg-blue-purple-gradient text-white rounded-br-none' 
                              : 'bg-white/10 text-white rounded-bl-none border border-white/10'}`}
                          >
                            <div className="flex justify-between items-baseline mb-1">
                              <span className={`font-semibold text-xs ${isCurrentUser ? 'text-white/80' : 'text-secondary-300'}`}>
                                {isCurrentUser ? 'You' : senderName}
                              </span>
                              {msg.timestamp && (
                                <span className={`text-xs ml-2 ${isCurrentUser ? 'text-white/60' : 'text-white/40'}`}>
                                  {formatTime(msg.timestamp)}
                                </span>
                              )}
                            </div>
                            <div>{msg.message}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={sendChatMessage} className="flex border-t border-white/10">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder-white/40"
                    aria-label="Chat message"
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 transition-colors flex items-center disabled:bg-primary-800/50 disabled:cursor-not-allowed"
                    disabled={!newMessage.trim()}
                    aria-label="Send message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-80 overflow-y-auto p-4 bg-black/20">
                <div className="mb-4 text-white/80 text-sm italic border-l-2 border-secondary-500/50 pl-3">
                  Use this private area to take notes about other players, strategies, and your observations. These notes are only visible to you.
                </div>
                
                <div className="space-y-4">
                  {playerRole && (
                    <div className={`rounded-xl p-3 ${getRoleCardBackground(playerRole)}`}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center" style={{background: getRoleGradient(playerRole)}}>
                          {getRoleIcon(playerRole)}
                        </div>
                        <h3 className="font-bold text-white">Your Role: {playerRole}</h3>
                      </div>
                      <div className="mt-2 text-white/80 text-sm">
                        {getRoleStrategy(playerRole)}
                      </div>
                    </div>
                  )}
                  
                  <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                    <h3 className="font-bold text-white flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Player Analysis
                    </h3>
                    
                    <div className="space-y-2 text-white/80 text-sm">
                      {players.filter(p => p.socketId !== socket.id).map(player => (
                        <div key={player.socketId} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="font-medium">{player.username}</div>
                          <div className="text-xs text-white/60">Analyze their behavior and communication...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                    <h3 className="font-bold text-white flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Quick Tips
                    </h3>
                    
                    <ul className="space-y-1 text-white/80 text-sm list-disc list-inside">
                      <li>Pay attention to how players react during discussions</li>
                      <li>Watch for inconsistencies in behavior</li>
                      <li>Don't reveal your role unless necessary</li>
                      <li>Use the chat to gain information without revealing too much</li>
                      <li>Consider who's being quiet vs. who's talking a lot</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for role styling and information
function getRoleCardBackground(role) {
  switch (role) {
    case 'King':
      return 'bg-warning-900/30 border border-warning-500/30';
    case 'Queen':
      return 'bg-secondary-900/30 border border-secondary-500/30';
    case 'Police':
      return 'bg-primary-900/30 border border-primary-500/30';
    case 'Thief':
      return 'bg-danger-900/30 border border-danger-500/30';
    case 'Minister':
      return 'bg-success-900/30 border border-success-500/30';
    default:
      return 'bg-neutral-900/30 border border-neutral-500/30';
  }
}

function getRoleGradient(role) {
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
}

function getRoleIcon(role) {
  switch (role) {
    case 'King':
      return '👑';
    case 'Queen':
      return '👸';
    case 'Police':
      return '🕵️';
    case 'Thief':
      return '🦹';
    case 'Minister':
      return '🧙';
    default:
      return '❓';
  }
}

function getRoleStrategy(role) {
  switch (role) {
    case 'King':
      return "As the King, try to blend in. Don't act too royal or draw too much attention. Let the Queen and Minister subtly protect you while you observe suspicious behaviors. Use chat to gather information without revealing your identity.";
    case 'Queen':
      return "Your role is to protect the King without making it obvious who the King is. Observe players carefully and try to identify the Thief through their behavior. Use misdirection if needed, but be careful not to accidentally reveal the King.";
    case 'Police':
      return "As the Police, your job is to carefully observe everyone and identify the Thief. Watch for suspicious behavior, inconsistent statements, or nervousness. When you're confident, click on a player to make your guess.";
    case 'Thief':
      return "Stay under the radar. Don't act suspicious and blend in with the other players. Observe who might be the King and Queen by their interactions, but don't be too obvious about it. Misdirection can be your ally.";
    case 'Minister':
      return "Support the royal court by helping to identify the Thief. Your role allows you to watch other players objectively. Pay attention to who the Police might be suspecting and how players react to statements in chat.";
    default:
      return "Role strategy unavailable.";
  }
}

export default GameUI;