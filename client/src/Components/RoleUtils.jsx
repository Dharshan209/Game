import React from 'react';

// Role Banner Component
export const RoleBanner = ({ role, roundEnded }) => {
  return (
    <div className={`mb-5 p-4 rounded-xl ${getRoleBannerClasses(role)} flex flex-col md:flex-row md:items-center md:justify-between`}>
      <div className="flex items-center mb-2 md:mb-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md" 
             style={{background: getRoleGradient(role)}}>
          {getRoleIcon(role)}
        </div>
        <div>
          <span className="font-bold text-lg block md:inline-block md:mr-2">Your Role: {role}</span>
          <span className="text-sm opacity-90">{getRoleDescription(role)}</span>
        </div>
      </div>
      <div className="md:ml-4">
        {getRoleAction(role, roundEnded)}
      </div>
    </div>
  );
};

// Helper function to get role banner classes
export const getRoleBannerClasses = (role) => {
  switch (role) {
    case 'King':
      return 'bg-gradient-to-r from-warning-600/20 to-warning-600/10 border border-warning-500/30';
    case 'Queen':
      return 'bg-gradient-to-r from-secondary-600/20 to-secondary-600/10 border border-secondary-500/30';
    case 'Police':
      return 'bg-gradient-to-r from-primary-600/20 to-primary-600/10 border border-primary-500/30';
    case 'Thief':
      return 'bg-gradient-to-r from-danger-600/20 to-danger-600/10 border border-danger-500/30';
    case 'Minister':
      return 'bg-gradient-to-r from-success-600/20 to-success-600/10 border border-success-500/30';
    default:
      return 'bg-gradient-to-r from-neutral-600/20 to-neutral-600/10 border border-neutral-500/30';
  }
};

// Helper function to get role gradient background
export const getRoleGradient = (role) => {
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
};

// Helper function to get role icon
export const getRoleIcon = (role) => {
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
};

// Helper function to get role description
export const getRoleDescription = (role) => {
  switch (role) {
    case 'King':
      return "Protected by others. Act royal but don't be too obvious!";
    case 'Queen':
      return "Help protect the King's identity and observe others.";
    case 'Police':
      return "Find and catch the Thief through observation.";
    case 'Thief':
      return "Try to avoid being caught by blending in with others.";
    case 'Minister':
      return "Help protect the royal court while observing others.";
    default:
      return "Role description unavailable.";
  }
};

// Helper function to get role-specific action text
export const getRoleAction = (role, roundEnded) => {
  if (roundEnded) return null;
  
  switch (role) {
    case 'Police':
      return (
        <span className="text-sm bg-primary-600/20 px-3 py-1.5 rounded-full inline-flex items-center border border-primary-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Click on a player to identify the Thief
        </span>
      );
    case 'Thief':
      return (
        <span className="text-sm bg-danger-600/20 px-3 py-1.5 rounded-full inline-flex items-center border border-danger-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
          Act natural to avoid detection!
        </span>
      );
    default:
      return (
        <span className="text-sm bg-white/10 px-3 py-1.5 rounded-full inline-flex items-center border border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
          Observe others and interact via chat
        </span>
      );
  }
};

// Helper function for role strategy (used in GameUI)
export const getRoleStrategy = (role) => {
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
};

// Helper function for role card background in GameUI
export const getRoleCardBackground = (role) => {
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
};