import React from 'react';

const ConnectionStatus = ({ 
  isConnectionIssue, 
  mediaError, 
  isRequestingMedia, 
  isLocalVideoLoaded,
  onReconnect
}) => {
  return (
    <>
      {/* Connection issue notification */}
      {isConnectionIssue && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-danger-600/90 backdrop-blur-md text-white p-4 flex items-center shadow-xl rounded-lg max-w-md border border-danger-500/50 animate-slide-in-up">
          <div className="mr-3 flex-shrink-0">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold">Connection issues detected!</p>
            <p className="text-sm">Try reconnecting to restore your connections.</p>
          </div>
          <button 
            onClick={onReconnect}
            className="ml-auto bg-white text-danger-600 text-sm font-bold py-1.5 px-4 rounded-full hover:bg-white/90 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Media error notification */}
      {mediaError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-danger-600/90 backdrop-blur-md text-white p-4 flex items-center shadow-xl rounded-lg max-w-md border border-danger-500/50 animate-slide-in-up">
          <div className="mr-3 flex-shrink-0">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Camera/Microphone Error</p>
            <p className="text-sm">{mediaError}. Please check your permissions.</p>
          </div>
        </div>
      )}

      {/* Media loading state */}
      {isRequestingMedia && !isLocalVideoLoaded && (
        <div className="p-5 rounded-xl bg-primary-600/20 border border-primary-500/30 mb-5 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Requesting camera and microphone access...</span>
        </div>
      )}
    </>
  );
};

export default ConnectionStatus;