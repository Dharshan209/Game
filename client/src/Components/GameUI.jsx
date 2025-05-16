import { useState, useEffect } from 'react';

const EMOJIS = ['👍', '👏', '😊', '😂', '🎮', '🎯', '🕵️', '👑', '🤔', '😮'];

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
  
  const handleChatMessage = (data) => {
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
  };
  
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    socket.emit('game:chat', { roomId, message: newMessage });
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
  
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'King':
        return 'bg-yellow-600';
      case 'Queen':
        return 'bg-purple-600';
      case 'Police':
        return 'bg-blue-600';
      case 'Thief':
        return 'bg-red-600';
      case 'Minister':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  const getRoleTextColor = (role) => {
    switch (role) {
      case 'King':
        return 'text-yellow-600';
      case 'Queen':
        return 'text-purple-600';
      case 'Police':
        return 'text-blue-600';
      case 'Thief':
        return 'text-red-600';
      case 'Minister':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const startNextRound = () => {
    socket.emit('game:next-round', { roomId });
    setGuessResult(null);
  };
  
  return (
    <div className="mt-4 w-full max-w-4xl mx-auto">
      {/* Game Status Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-4 rounded-t-lg flex flex-col sm:flex-row justify-between items-center shadow-lg">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="font-bold text-lg sm:text-xl mr-3">{roomId}</div>
          <div className="flex items-center bg-blue-800 rounded-full px-3 py-1">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm">{players.length}/5 Players</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          {isGameStarted ? (
            <div className="bg-yellow-500 text-yellow-900 font-bold px-4 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Round {round}/{maxRounds}
            </div>
          ) : (
            <div className="bg-blue-600 text-white font-bold px-4 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Waiting for players...
            </div>
          )}
          
          {playerRole && (
            <div className={`text-white px-4 py-1 rounded-full text-sm font-bold flex items-center ${getRoleBadgeColor(playerRole)}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              {playerRole}
            </div>
          )}
        </div>
      </div>
      
      {/* Game Action Area */}
      <div className="bg-gray-100 p-4 rounded-b-lg shadow-md">
        {/* Ready Button / Round Controls */}
        <div className="flex justify-center mb-6">
          {!isGameStarted && !isReady && (
            <button 
              onClick={markReady}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 hover:shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              I'm Ready to Play!
            </button>
          )}
          
          {!isGameStarted && isReady && (
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full mb-2 opacity-50">
                Ready! Waiting for others...
              </div>
              <div className="text-sm text-gray-600">Waiting for other players to get ready</div>
            </div>
          )}
          
          {isRoundEnded && isGameStarted && (
            <div className="text-center bg-white p-4 rounded-lg shadow-md w-full max-w-md border-2 border-blue-200">
              {guessResult && (
                <div className="mb-4">
                  <div className={`text-2xl font-bold mb-2 ${guessResult.isCorrect ? 'text-blue-600' : 'text-red-600'}`}>
                    {guessResult.isCorrect 
                      ? '🎉 The Police caught the Thief!' 
                      : '🏃‍♂️ The Thief escaped!'}
                  </div>
                  <div className="bg-gray-100 rounded p-3 text-sm">
                    {guessResult.isCorrect
                      ? <span>The Police has earned 1 point for catching the Thief!</span>
                      : <span>The Thief has earned 1 point for escaping!</span>
                    }
                  </div>
                </div>
              )}
              
              <button 
                onClick={startNextRound}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 hover:shadow-lg flex items-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Next Round
              </button>
            </div>
          )}
          
          {isGameStarted && !isRoundEnded && (
            <div className="text-center bg-white p-4 rounded-lg shadow-md w-full max-w-md border-l-4 border-blue-500">
              {playerRole === 'Police' ? (
                <div>
                  <div className="text-lg font-semibold text-blue-600 mb-2">You are the Police!</div>
                  <div className="flex items-center justify-center text-gray-700 bg-blue-50 p-3 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Click on a player's video to guess who is the Thief
                  </div>
                </div>
              ) : (
                <div>
                  <div className={`text-lg font-semibold mb-2 ${getRoleTextColor(playerRole)}`}>
                    You are the {playerRole}!
                  </div>
                  <div className="flex items-center justify-center text-gray-700 bg-gray-50 p-3 rounded">
                    {playerRole === 'Thief' ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                        Stay hidden! Don't act suspicious.
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Watch the game unfold and interact with others
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Scores Panel */}
        {Object.keys(scores).length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-2 px-4 font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Scoreboard
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-3">
              {Object.entries(scores).map(([playerId, score]) => {
                const player = players.find(p => p.socketId === playerId);
                const isCurrentPlayer = playerId === socket.id;
                return (
                  <div 
                    key={playerId} 
                    className={`bg-gray-50 p-3 rounded-lg shadow-sm border ${isCurrentPlayer ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} transition-transform transform hover:scale-105`}
                  >
                    <div className="font-medium text-gray-700 truncate">
                      {player?.username || `Player ${playerId.substring(0, 4)}`}
                      {isCurrentPlayer && <span className="ml-1 text-xs text-blue-500">(You)</span>}
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <div className="text-2xl font-bold text-indigo-600">{score}</div>
                      <div className="text-xs text-gray-500 ml-1">pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Chat & Emoji Area */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          {/* Chat Panel */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              Game Chat
            </div>
            <div className="h-56 overflow-y-auto p-3 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isCurrentUser = msg.senderId === socket.id;
                  return (
                    <div 
                      key={idx} 
                      className={`mb-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs rounded-lg px-4 py-2 ${isCurrentUser 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                      >
                        {!isCurrentUser && (
                          <div className="font-semibold text-xs mb-1">
                            {msg.username || msg.senderId.substring(0, 6)}
                          </div>
                        )}
                        <div>{msg.message}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={sendChatMessage} className="flex border-t border-gray-200">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 transition-colors flex items-center"
                disabled={!newMessage.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
          
          {/* Emoji Panel */}
          <div className="w-full lg:w-64">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
                Reactions
              </div>
              <div className="p-3">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => sendEmoji(emoji)}
                      className="text-2xl hover:bg-gray-100 p-2 rounded-full transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 text-center mt-2">
                  Click an emoji to send a reaction to all players
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameUI;