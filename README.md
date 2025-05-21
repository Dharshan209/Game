# GameVerse - Interactive Video-based Social Deduction Game

![GameVerse](/client/public/vite.svg)

## Overview

GameVerse is an immersive online multiplayer platform that combines real-time video communication with social deduction gameplay. Players join virtual rooms where they interact face-to-face while taking on secret roles in a game of observation, deduction, and strategy. The application leverages WebRTC for peer-to-peer video connections, Socket.IO for real-time communication, and React for a responsive, modern interface.

## Key Features

### Real-Time Video Communication

- **Peer-to-Peer Video Streaming**: Players connect directly to each other using WebRTC, ensuring low-latency video and audio communication
- **Responsive Video Grid**: Adaptive layout that organizes video feeds in an optimized grid (2 per row) that works across mobile, tablet, and desktop devices
- **Video Controls**: Participants can toggle their camera, mute audio, and enter fullscreen mode
- **Connection Status Monitoring**: The system automatically detects and attempts to recover from connection issues

### Engaging Gameplay

- **Role-Based Gameplay**: Players are assigned unique roles (King, Queen, Police, Thief, Minister) each with distinct objectives
- **Multiple Rounds**: Games are played across multiple rounds with rotating roles
- **Deduction Mechanics**: The Police player must identify the Thief through observation and deduction
- **Emoji Reactions**: Players can express emotions and reactions without revealing their role
- **Scoring System**: Points are awarded based on successful role execution
- **Round & Game Results**: Clear visual feedback on round outcomes and final winners

### Social Features

- **Room Creation & Sharing**: Users can create game rooms and share links with friends
- **Room Codes**: Short, easy-to-remember room codes for quick joining
- **Player Names**: Custom usernames allow for personal identification
- **Game Instructions**: Detailed in-game tutorial explains roles and mechanics

## Technical Architecture

### Client-Side

The frontend is built with modern web technologies:

- **React**: For building a component-based UI with efficient state management
- **Vite**: Fast build tooling and development server
- **Tailwind CSS**: Utility-first CSS framework for custom, responsive design
- **Socket.IO Client**: For real-time bidirectional event-based communication
- **WebRTC APIs**: For establishing peer connections and streaming media

The client architecture is organized into:
- Components for UI elements and game-specific interfaces
- WebRTC connection management with ICE candidate buffering
- Socket event handling for game state synchronization
- Media stream handling for camera and microphone

### Server-Side

The backend provides game logic and WebRTC signaling:

- **Node.js**: JavaScript runtime for the server
- **Express**: Web framework for handling HTTP requests
- **Socket.IO**: For real-time event handling and WebRTC signaling
- **Game State Management**: Server-side logic for role assignment and scoring

The server is responsible for:
- Room management (creation, joining, user tracking)
- WebRTC signaling (offer/answer exchange, ICE candidate delivery)
- Game state synchronization across players
- Role assignment and validation of game actions

## Game Roles and Mechanics

GameVerse features a social deduction gameplay where players assume different roles:

- **King**: Protected by others, must stay hidden from the Thief
- **Queen**: Helps protect the King's identity while observing others
- **Police**: Must identify and catch the Thief through observation
- **Thief**: Tries to avoid detection by blending in with others
- **Minister**: Assists the royal court and helps identify suspicious behavior

Each round follows a structure:
1. Roles are randomly assigned to players
2. Players interact via video to observe behavior
3. The Police player can make a guess about who the Thief is
4. Points are awarded based on correct/incorrect guesses
5. After several rounds, the player with the most points wins

## Technical Challenges Overcome

GameVerse addresses several complex technical challenges:

- **Reliable P2P Connections**: Implementing bidirectional connection establishment and ICE candidate buffering ensures robust video connections across different network conditions
- **Responsive Video Grid**: The adaptive grid layout ensures optimal video display regardless of the number of participants or device screen size
- **State Synchronization**: Keeping game state synchronized across all players while handling disconnections and reconnections
- **Media Stream Management**: Ensuring camera and microphone access works consistently across devices and browsers

## Future Enhancements

- **Additional Game Modes**: New social deduction scenarios with different roles
- **Customization Options**: Player avatars, room themes, and game length options
- **Spectator Mode**: Allow users to watch ongoing games without participating
- **Mobile App**: Native iOS and Android applications
- **Enhanced Accessibility**: Full keyboard navigation and screen reader support

---

GameVerse represents a fusion of modern web technologies and creative game design, bringing people together through both real-time video interaction and engaging social gameplay. Whether playing with friends or meeting new people, GameVerse creates memorable experiences through its unique combination of face-to-face communication and strategic deduction.