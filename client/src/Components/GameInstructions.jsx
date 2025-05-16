import { useState } from 'react';

function GameInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-30"
      >
        How to Play
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-800">How to Play</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <section>
                <h3 className="text-xl font-semibold text-purple-700 mb-2">Game Overview</h3>
                <p>
                  This is a multiplayer video-based game for 3-5 players. Each player gets a random hidden role and 
                  must use deduction and observation to fulfill their role's objectives.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-700 mb-2">Roles</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-bold text-yellow-600">King:</span> Protected by the Queen and Minister, maintain your royal presence.
                  </li>
                  <li>
                    <span className="font-bold text-purple-600">Queen:</span> Help protect the King's identity while observing others.
                  </li>
                  <li>
                    <span className="font-bold text-blue-600">Police:</span> Your task is to identify and catch the Thief. Click on a player's video to make a guess!
                  </li>
                  <li>
                    <span className="font-bold text-red-600">Thief:</span> Try to avoid being caught by the Police by blending in.
                  </li>
                  <li>
                    <span className="font-bold text-green-600">Minister:</span> (Only in 5-player games) Help protect the royal court while observing others.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-700 mb-2">Gameplay</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>All players enter the room and mark themselves as "Ready".</li>
                  <li>Once all players are ready, each player is secretly assigned a role.</li>
                  <li>Players can use the chat and emoji reactions during the game.</li>
                  <li>Each round, the Police must try to guess who the Thief is by clicking on their video.</li>
                  <li>When the Police makes a guess:
                    <ul className="list-disc pl-5 mt-1">
                      <li>If correct: The Police gets 1 point</li>
                      <li>If incorrect: The Thief gets 1 point</li>
                    </ul>
                  </li>
                  <li>After a guess is made, roles are revealed and the round ends.</li>
                  <li>The game continues for multiple rounds with roles reassigned each round.</li>
                  <li>After all rounds, the player with the most points wins!</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-purple-700 mb-2">Tips</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use the chat to discuss and try to deduce others' roles.</li>
                  <li>The Thief should try to act natural and avoid suspicious behavior.</li>
                  <li>The Police should observe carefully before making a guess.</li>
                  <li>React with emojis to communicate or distract others!</li>
                  <li>Each round is a fresh start with new roles - adapt your strategy!</li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GameInstructions;