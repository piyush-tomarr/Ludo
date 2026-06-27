import { HomePawns } from './HomePawns'
import Chat from './Chat';
import socket from "../socket";
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from "react";
import { MAIN_PATH } from "../Data/path";
import { MovingPawn } from './MovingPawn';
import classes from './Board.module.css'
import pawnClasses from './Pawn.module.css';
import { fetchGameState, movePawnFun, rollDiceFun, rewardCoinsFun } from '../Services/ApiFun';
import { useSocket } from '../hooks/useSocket';
import Dice from './Dice';
import { useSound } from '../context/SoundContext';
import moveSoundPath from '../Sounds/move.mp3';
import jumpSoundPath from '../Sounds/jump.mp3';
import killSoundPath from '../Sounds/kill.mp3';
import rollSoundPath from '../Sounds/roll.mp3';
import timerSoundPath from '../Sounds/timer.mp3';
import enterTrianglePath from '../Sounds/enter_triangle.mp3';
import winSoundPath from '../Sounds/winner.mp3';

const moveSound = new Audio(moveSoundPath);
const jumpSound = new Audio(jumpSoundPath);
const killSound = new Audio(killSoundPath);
const rollSound = new Audio(rollSoundPath);
const enterTriangleSound = new Audio(enterTrianglePath);
const winSound = new Audio(winSoundPath);
const finishSound = new Audio(killSoundPath); // Fallback to kill sound
const startSound = new Audio(moveSoundPath); // Fallback to move sound
const PLAYER_ORDER = ["#f44336", "#4caf50", "#fad416", "#2196f3"];

const CrownIcon = ({ x, y, boardRotation }) => (
  <g transform={`translate(${x}, ${y}) rotate(${-boardRotation})`}>
    {/* Base of the crown */}
    <rect x="-0.4" y="0.1" width="0.8" height="0.2" fill="#ffd700" stroke="#b8860b" strokeWidth="0.03" />
    {/* Crown spikes */}
    <path
      d="M -0.4,0.1 L -0.5,-0.3 L -0.2,0 L 0,-0.5 L 0.2,0 L 0.5,-0.3 L 0.4,0.1 Z"
      fill="#ffd700"
      stroke="#b8860b"
      strokeWidth="0.03"
    />
    {/* Gems on spikes */}
    <circle cx="0" cy="-0.5" r="0.06" fill="#ff0000" stroke="#b8860b" strokeWidth="0.01" />
    <circle cx="0.5" cy="-0.3" r="0.05" fill="#2196f3" stroke="#b8860b" strokeWidth="0.01" />
    <circle cx="-0.5" cy="-0.3" r="0.05" fill="#4caf50" stroke="#b8860b" strokeWidth="0.01" />
  </g>
);

const ExitIcon = ({ x, y, color, boardRotation }) => {
  const isLeftSide = x < 7.5;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${-boardRotation})`}>
      {/* Solid white background centered in the 4x4 inner box */}
      <rect x="-2" y="-2" width="4" height="4" rx="0.3" fill="#fff" />
      <rect x="-1.85" y="-1.85" width="3.7" height="3.7" rx="0.2" fill="none" stroke={color} strokeWidth="0.08" opacity="0.3" />
      <g transform={`scale(${isLeftSide ? -1 : 1}, 1)`}>
        <g transform="translate(-1.3, -1.3) scale(0.12)">
          {/* Running man figure */}
          <path
            d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2V11h2V8.3l2.8-1.2-1.1 5"
            fill={color}
          />
          {/* Door frame */}
          <path
            d="M22 13V2c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-9h-2v7H4V2h16v11h2z"
            fill={color}
          />
        </g>
      </g>
    </g>
  );
};

// ðŸ‘¨â€ðŸŽ¨ Helper to ensure yellow consistency between legacy and current color codes
const normalizeColor = (color) => {
  if (!color) return color;
  const lower = color.trim().toLowerCase();
  if (lower === "#fad416") return "#fad416";
  return lower;
};

const HOME_TURN_START = {
  "#fad416": { x: 14, y: 7 },
  "#2196f3": { x: 7, y: 14 },
  "#f44336": { x: 0, y: 7 },
  "#4caf50": { x: 7, y: 0 }
};

const LANE_DIRECTION = {
  "#fad416": { dx: -1, dy: 0 },
  "#2196f3": { dx: 0, dy: -1 },
  "#f44336": { dx: 1, dy: 0 },
  "#4caf50": { dx: 0, dy: 1 }
};

const ENTRY_INDEX = {
  "#f44336": 41,
  "#4caf50": 2,
  "#fad416": 15,
  "#2196f3": 28,
};

const SAFE_TILES = [
  { x: 8, y: 1 },   // Green entry
  { x: 12, y: 6 },
  { x: 13, y: 8 },  // Yellow entry
  { x: 8, y: 12 },
  { x: 6, y: 13 },  // Blue entry
  { x: 2, y: 8 },
  { x: 1, y: 6 },   // Red entry
  { x: 6, y: 2 },
];

const SPEED = 300;

import emojilib from 'emojilib';

const getEmoji = (searchKeys) => {
  for (const [emoji, tags] of Object.entries(emojilib)) {
    if (searchKeys.some(key => tags.includes(key))) {
      return emoji;
    }
  }
  return '⭐'; // fallback
};

const STICKERS = [
  { id: 'baby', emoji: getEmoji(['baby']), cost: 50, label: 'Baby' },
  { id: 'dice3', emoji: getEmoji(['dice', 'game_die']), cost: 25, label: 'Lucky 3' },
  { id: 'fist', emoji: getEmoji(['fist']), cost: 30, label: 'Power' },
  { id: 'flower', emoji: getEmoji(['rose', 'flower']), cost: 1, label: 'Love' },
  { id: 'muscle', emoji: getEmoji(['muscle']), cost: 40, label: 'Strong' },
  { id: 'thinking', emoji: getEmoji(['thinking', 'thinking_face']), cost: 30, label: 'Hmm...' },
  { id: 'begging', emoji: getEmoji(['pray', 'pleading']), cost: 40, label: 'Please' },
  { id: 'sad', emoji: getEmoji(['cry', 'sad']), cost: 30, label: 'Nooo' },
  { id: 'punch', emoji: getEmoji(['punch']), cost: 40, label: 'Bam!' },
  { id: 'smile', emoji: getEmoji(['smile', 'blush']), cost: 25, label: 'Happy' },
  { id: 'fire', emoji: getEmoji(['fire']), cost: 25, label: 'Hot!' },
  { id: 'thumbsup', emoji: getEmoji(['thumbsup', '+1']), cost: 40, label: 'Nice' },
  { id: 'tomato', emoji: getEmoji(['tomato']), cost: 50, label: 'Boo!' },
  { id: 'thumbsdown', emoji: getEmoji(['thumbsdown', '-1']), cost: 50, label: 'Bad' },
  { id: 'dice4', emoji: getEmoji(['dice', 'game_die']), cost: 25, label: 'Lucky 4' },
  { id: 'dice5', emoji: getEmoji(['dice', 'game_die']), cost: 25, label: 'Lucky 5' },
  { id: 'wink', emoji: getEmoji(['wink']), cost: 25, label: 'Wink' },
  { id: 'angry', emoji: getEmoji(['angry', 'rage']), cost: 25, label: 'Mad' },
  { id: 'hammer', emoji: getEmoji(['hammer']), cost: 25, label: 'Hammer' },
  { id: 'prayer', emoji: getEmoji(['pray', 'palms_up_together']), cost: 40, label: 'Prayer' },
];

const Board = ({ gameId, playerName, playerColor, isComputerGame: propIsComputerGame }) => {
  const { isMusicMuted, isSfxMuted, toggleMusic, toggleSfx, musicVolume, sfxVolume, setMusicVolume, setSfxVolume, playGameStartSound, initBgMusic, pauseBgMusic, resumeBgMusic } = useSound();
  const toggleAllSounds = () => {
    toggleMusic();
    toggleSfx();
  };

  useEffect(() => {
    if (playGameStartSound) playGameStartSound();

    // Pause menu music when game starts
    pauseBgMusic();
    return () => {
      // Resume menu music when game ends/leaves
      resumeBgMusic();
    };
  }, [playGameStartSound, pauseBgMusic, resumeBgMusic]);



  const [myColor, setMyColor] = useState(playerColor);

  const [dice, setDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [pawns, setPawns] = useState([
    { id: 1, color: "#f44336", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 2, color: "#f44336", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 3, color: "#f44336", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 4, color: "#f44336", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },

    { id: 5, color: "#4caf50", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 6, color: "#4caf50", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 7, color: "#4caf50", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 8, color: "#4caf50", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },

    { id: 9, color: "#2196f3", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 10, color: "#2196f3", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 11, color: "#2196f3", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 12, color: "#2196f3", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },

    { id: 13, color: "#fad416", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 14, color: "#fad416", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 15, color: "#fad416", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
    { id: 16, color: "#fad416", pathIndex: -1, homeIndex: -1, stepsTravelled: 0, isFinished: false },
  ]);
  const pawnsRef = useRef([]); // ðŸ•µï¸â€â™‚ï¸ Ref for stale closure safety
  const navigate = useNavigate();
  const [finishedOrder, setFinishedOrder] = useState([]); // List of colors in order of finishing
  const location = useLocation();
  const [isComputerGame] = useState(() => {
    const fromProp = propIsComputerGame || location.state?.isComputerGame;
    if (fromProp !== undefined) {
      sessionStorage.setItem(`ludo_comp_${gameId}`, fromProp);
      return fromProp;
    }
    return sessionStorage.getItem(`ludo_comp_${gameId}`) === 'true';
  });

  const [isLocalGame] = useState(() => {
    const fromState = location.state?.isLocalGame;
    if (fromState !== undefined) {
      sessionStorage.setItem(`ludo_local_${gameId}`, fromState);
      return fromState;
    }
    const stored = sessionStorage.getItem(`ludo_local_${gameId}`);
    if (stored !== null) return stored === 'true';
    return !propIsComputerGame && !location.state?.isComputerGame && !location.state?.gameId && !gameId;
  });

  const [isLoading, setIsLoading] = useState(true);
  const isWaitingForSync = useRef(false);
  const syncTimeoutRef = useRef(null);
  const currentTurnRef = useRef(null); // ðŸ•µï¸â€â™‚ï¸ Reference of the actual turn for AI safety

  const [currentTurn, _setCurrentTurn] = useState(null);

  // Custom setter to keep ref in sync
  const setCurrentTurn = (turn) => {
    const norm = normalizeColor(turn);
    currentTurnRef.current = norm;
    _setCurrentTurn(norm);
  };
  const [playerNames, setPlayerNames] = useState({}); // { "#f44336": "Player 1", ... }
  const [playerStatuses, setPlayerStatuses] = useState({}); // { "#f44336": "active", ... }
  const playerStatusesRef = useRef({}); // ðŸ•µï¸â€â™‚ï¸ Track previous statuses for notifications

  const [winner, setWinner] = useState(null);
  const [winnerColor, setWinnerColor] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [gameResult, setGameResult] = useState(null); // 'win' or 'loss'
  const [showWinOverlay, setShowWinOverlay] = useState(false);

  const [isGiftingOpen, setIsGiftingOpen] = useState(false);
  const [giftTarget, setGiftTarget] = useState(null);
  const [activeGifts, setActiveGifts] = useState({}); // { color: { giftId, timestamp } }
  const [activeStickers, setActiveStickers] = useState({}); // { color: sticker }
  const [playerLives, setPlayerLives] = useState({}); // { color: lives }
  const MAX_LIVES = 5;
  const playerRefs = useRef({}); // ðŸ•µï¸â€â™‚ï¸ Refs for player tab positions
  const boardPlayerRefs = useRef({}); // ðŸ•µï¸â€â™‚ï¸ Refs for board base positions
  const [flyingStickers, setFlyingStickers] = useState([]); // Array of flying gift objects
  const [isBoardShaking, setIsBoardShaking] = useState(false);

  // ðŸ•µï¸â€â™‚ï¸ IDENTIFY LOCAL PLAYER: In local games, Slot 0 (Red) or Slot 3 (Blue) is "Me" for rotation purposes
  useEffect(() => {
    if ((isLocalGame || isComputerGame) && !myColor && Object.keys(playerNames).length > 0) {
      // Prioritize the player in the 1st position (Red)
      const primaryColor = playerNames["#f44336"] ? "#f44336" : Object.keys(playerNames)[0];
      if (primaryColor) {
        setMyColor(primaryColor);
      }
    }
  }, [isLocalGame, isComputerGame, myColor, playerNames]);

  const startSyncTimeout = useCallback(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      if (isWaitingForSync.current) {
        console.warn("ðŸ›¡ï¸ Sync Timeout: Releasing sync lock.");
        isWaitingForSync.current = false;
      }
    }, 5000); // 5s safety
  }, []);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  const MAX_TIME = 15;
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);

  const [notification, setNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const rollLock = useRef(false); // 🔒 Prevent multiple roll clicks
  const isRollingRef = useRef(false); // 🕵️ Ref for stale closure safety
  const hasNavigatedAway = useRef(false); // 🛡️ Navigation guard
  const isGameOverRef = useRef(false); // 🕵️ Safe ref for game-over checks in callbacks
  const isAutoActionRef = useRef(false); // 🤖 Track if current turn action is automated due to timeout
  const pawnsRefForTimeout = useRef([]); // 🕵️ Stable ref for timeout logic
  const handlePawnClickRef = useRef(null); // 🕵️ Stable ref for handlePawnClick to prevent stale closures and TDZ issues
  useEffect(() => {
    pawnsRefForTimeout.current = pawns;
  }, [pawns]);

  // Sync refs with state
  useEffect(() => {
    isRollingRef.current = isRolling;
  }, [isRolling]);

  useEffect(() => {
    pawnsRef.current = pawns;
  }, [pawns]);

  const changeTurn = () => {
    setCurrentTurn(prev => {
      const normalizedPrev = normalizeColor(prev);
      const currentIndex = PLAYER_ORDER.indexOf(normalizedPrev);
      if (currentIndex === -1) return PLAYER_ORDER[0];

      // Find next player who is actually in the game
      for (let i = 1; i <= PLAYER_ORDER.length; i++) {
        const nextIndex = (currentIndex + i) % PLAYER_ORDER.length;
        const nextColor = PLAYER_ORDER[nextIndex];
        if (playerNames[nextColor]) {
          console.log("🔄 Local turn change:", normalizedPrev, "->", nextColor);
          return nextColor;
        }
      }
      return normalizedPrev;
    });
  };



  const [isChatOpen, setIsChatOpen] = useState(false);
  const isChatOpenRef = useRef(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [floatingMessages, setFloatingMessages] = useState([]); // 🎈 Messages that appear on screen briefly

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
    if (isChatOpen) setUnreadCount(0); // Clear unread count when opening chat
  }, [isChatOpen]);

  useEffect(() => {
    // 🛡️ RESET LOCKS: Prevent stuck turn if a socket message was missed
    isWaitingForSync.current = false;
    rollLock.current = false;
    setIsAnimating(false); // Emergency reset
    isAutoActionRef.current = false; // 🤖 Reset auto-action flag for the new turn

    console.log("🔄 Turn transition safety reset triggered for:", currentTurnRef.current);

    // 🛡️ IDENTITY SAFETY: Re-verify my color on turn change
    if (!isLocalGame && !isComputerGame && !myColor && Object.keys(playerNames).length > 0) {
      const effectivePlayerName = (playerName || localStorage.getItem('ludo_player_name') || "").trim().toLowerCase();
      if (effectivePlayerName) {
        const color = Object.keys(playerNames).find(c => (playerNames[c] || "").trim().toLowerCase() === effectivePlayerName);
        if (color) {
          const normalized = normalizeColor(color);
          console.log("🛡️ Recovered missing player color:", normalized);
          setMyColor(normalized);
        }
      }
    }
  }, [currentTurn]);

  // 📥 Handle incoming chat messages (Socket Listeners)
  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (msg) => {
        setChatMessages(prev => [...prev, msg]);

        // 🎈 Show floating bubble
        const messageId = Date.now() + Math.random();
        setFloatingMessages(prev => [...prev, { ...msg, id: messageId }]);

        // Auto-remove bubble after 4 seconds
        setTimeout(() => {
          setFloatingMessages(prev => prev.filter(m => m.id !== messageId));
        }, 4000);

        // Increment unread count if chat is closed AND it's not my message
        if (!isChatOpenRef.current) {
          const normLocalColor = myColor ? normalizeColor(myColor) : null;
          const normSenderColor = msg.color ? normalizeColor(msg.color) : null;
          const localName = (playerName || localStorage.getItem('ludo_player_name') || 'Player').trim().toLowerCase();
          const senderName = (msg.player || "").trim().toLowerCase();

          const isMe = (normLocalColor === normSenderColor) && (localName === senderName);

          if (!isMe) {
            setUnreadCount(prev => prev + 1);
          }
        }
      };

      const handleChatHistory = (history) => {
        setChatMessages(history);
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("chat_history", handleChatHistory);

      const handleReceiveGift = (data) => {
        console.log("🎁 Gift received:", data);
        const { fromColor, toColor, giftId } = data;
        const normFrom = normalizeColor(fromColor);
        const normTo = normalizeColor(toColor);

        // 🚀 Target the profile tabs (playerRefs) for the "Profile to Profile" animation
        const fromEl = playerRefs.current[normFrom];
        const toEl = playerRefs.current[normTo];

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          const flyingId = Date.now() + Math.random();
          const stickerObj = {
            id: flyingId,
            giftId,
            startX: fromRect.left + fromRect.width / 2,
            startY: fromRect.top + fromRect.height / 2,
            endX: toRect.left + toRect.width / 2,
            endY: toRect.top + toRect.height / 2
          };

          setFlyingStickers(prev => [...prev, stickerObj]);

          // 🎁 On arrival (matching CSS animation duration)
          setTimeout(() => {
            setFlyingStickers(prev => prev.filter(s => s.id !== flyingId));

            // Show simple popup on arrival (Softened feel)
            const stickerEmoji = STICKERS.find(s => s.id === giftId)?.emoji;
            if (stickerEmoji) {
              setActiveStickers(prev => ({ ...prev, [normTo]: stickerEmoji }));
              setTimeout(() => {
                setActiveStickers(prev => {
                  const next = { ...prev };
                  delete next[normTo];
                  return next;
                });
              }, 3000);
            }
          }, 800); // 0.8s flight time
        }
      };

      socket.on("receive_gift", handleReceiveGift);

      socket.on("receive_sticker", (data) => {
        const { color, sticker } = data;
        const normColor = normalizeColor(color);
        setActiveStickers(prev => ({ ...prev, [normColor]: sticker }));
        setTimeout(() => {
          setActiveStickers(prev => {
            const next = { ...prev };
            delete next[normColor];
            return next;
          });
        }, 3000);
      });

      socket.on("receive_life_update", (data) => {
        const { color, lives } = data;
        setPlayerLives(prev => ({ ...prev, [normalizeColor(color)]: lives }));
      });

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("chat_history", handleChatHistory);
        socket.off("receive_gift", handleReceiveGift);
        socket.off("receive_sticker");
        socket.off("receive_life_update");
      };
    }
  }, [socket]); // 🚀 Only depend on socket, NOT isChatOpen

  // 🔔 Local notifications logic (removed as per user request)



  const handleSendSticker = (sticker) => {
    if (socket && gameId && myColor) {
      // 1. Send as sticker (for profile popup)
      socket.emit("send_sticker", {
        gameId,
        color: myColor,
        sticker
      });

      // 2. Also send as message (for chat history and bubbles)
      const pName = playerName || localStorage.getItem('ludo_player_name') || 'Player';
      socket.emit("send_message", {
        gameId,
        text: sticker,
        player: pName,
        color: myColor,
        type: 'sticker'
      });

      setIsChatOpen(false);
      // Local preview for profile popup
      const normColor = normalizeColor(myColor);
      setActiveStickers(prev => ({ ...prev, [normColor]: sticker }));
      setTimeout(() => {
        setActiveStickers(prev => {
          const next = { ...prev };
          delete next[normColor];
          return next;
        });
      }, 3000);
    }
  };

  const handleSendGift = (giftId) => {
    if (socket && gameId && giftTarget) {
      socket.emit("send_gift", {
        gameId,
        fromColor: myColor,
        toColor: giftTarget,
        giftId,
        timestamp: Date.now()
      });
      setIsGiftingOpen(false);
      setGiftTarget(null);
    }
  };

  const openGiftDrawer = (targetColor) => {
    setGiftTarget(targetColor);
    setIsGiftingOpen(true);
  };

  const animatePawnBackToBase = useCallback((pawnId, fromIndex) => {
    setIsAnimating(true);
    const pawn = pawnsRef.current.find(p => p.id === pawnId);
    if (!pawn || fromIndex === -1) return;

    const entryIndex = ENTRY_INDEX[normalizeColor(pawn.color)];
    const KILL_SPEED = 30; // ⚡ ULTRA Fast-forward retreat (30ms per step)
    let currentIndex = fromIndex;

    // Play kill sound
    if (!isSfxMuted) {
      killSound.currentTime = 0;
      killSound.volume = sfxVolume;
      killSound.play().catch(e => console.log("Sound play blocked:", e));
    }

    const reverseStep = () => {
      // Move backward visually
      setPawns(prev =>
        prev.map(p =>
          p.id === pawnId
            ? { ...p, pathIndex: currentIndex, homeIndex: -1 }
            : p
        )
      );

      // 🛑 STOP when reached entry point
      if (currentIndex === entryIndex) {
        setTimeout(() => {
          setPawns(prev =>
            prev.map(p =>
              p.id === pawnId
                ? { ...p, pathIndex: -1, homeIndex: -1, stepsTravelled: 0 }
                : p
            )
          );
          setIsAnimating(false);
        }, KILL_SPEED);
        return;
      }

      // Decrement index
      currentIndex = currentIndex - 1;
      if (currentIndex < 0) currentIndex = 51;

      setTimeout(reverseStep, KILL_SPEED);
    };

    reverseStep();
  }, [isSfxMuted, sfxVolume]);



  const HOME_PATHS = {
    "#fad416": [ // YELLOW (right → center)
      { x: 13, y: 7 },
      { x: 12, y: 7 },
      { x: 11, y: 7 },
      { x: 10, y: 7 },
      { x: 9, y: 7 },
      { x: 8, y: 7 },
    ],
    "#2196f3": [ // BLUE (bottom → center)
      { x: 7, y: 13 },
      { x: 7, y: 12 },
      { x: 7, y: 11 },
      { x: 7, y: 10 },
      { x: 7, y: 9 },
      { x: 7, y: 8 },
    ],
    "#f44336": [ // RED (left → center)
      { x: 1, y: 7 },
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
      { x: 6, y: 7 },
    ],
    "#4caf50": [ // GREEN (top → center)
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 7, y: 5 },
      { x: 7, y: 6 },
    ],
  };


  // 🔊 Audio Helpers
  const playMoveSound = useCallback(() => {
    if (isSfxMuted || document.hidden) return;
    jumpSound.currentTime = 0;
    jumpSound.volume = sfxVolume;
    jumpSound.playbackRate = 1.5; // 🚀 Even faster jump sound
    jumpSound.play().catch(e => console.log("Sound play blocked:", e));
    setTimeout(() => jumpSound.pause(), 100); // ⏳ Ultra-short cut-off
  }, [isSfxMuted, sfxVolume]);

  const playRollSound = useCallback(() => {
    if (isSfxMuted || document.hidden) return;
    rollSound.currentTime = 0;
    rollSound.volume = sfxVolume;
    rollSound.play().catch(e => console.log("Sound play blocked:", e));
  }, [isSfxMuted, sfxVolume]);

  const playFinishSound = useCallback(() => {
    if (isSfxMuted || document.hidden) return;
    finishSound.currentTime = 0;
    finishSound.volume = sfxVolume;
    finishSound.play().catch(e => console.log("Sound play blocked:", e));
  }, [isSfxMuted, sfxVolume]);

  const playWinSound = useCallback(() => {
    if (isSfxMuted || document.hidden) return;
    winSound.currentTime = 0;
    winSound.volume = sfxVolume;
    winSound.play().catch(e => console.log("Sound play blocked:", e));
  }, [isSfxMuted, sfxVolume]);

  const playStartSound = useCallback(() => {
    if (isSfxMuted || document.hidden) return;
    startSound.currentTime = 0;
    startSound.volume = sfxVolume;
    startSound.play().catch(e => console.log("Sound play blocked:", e));
    // Play for 3-4 seconds (3.5s) as requested
    setTimeout(() => {
      startSound.pause();
      startSound.currentTime = 0;
    }, 3500);
  }, [isSfxMuted, sfxVolume]);

  const playTimerSound = useCallback(() => {
    if (isSfxMuted || document.hidden) return;
    const sound = timerSoundRef.current;
    sound.currentTime = 0;
    sound.volume = sfxVolume;
    sound.play().catch(e => console.log("Timer sound blocked:", e));
  }, [isSfxMuted, sfxVolume]);

  const playEnterTriangleSound = useCallback(() => {
    if (isSfxMuted || document.hidden) return;
    enterTriangleSound.currentTime = 0;
    enterTriangleSound.volume = sfxVolume;
    enterTriangleSound.play().catch(e => console.log("Sound play blocked:", e));
  }, [isSfxMuted, sfxVolume]);






  const [canMove, setCanMove] = useState(false);
  const lastMovedByMe = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const pendingTurn = useRef(null);
  const lastTimerTick = useRef(-1); // ⏳ Track last played second
  const timerSoundRef = useRef(new Audio(timerSoundPath)); // 🔊 Single sound instance


  const movePawnStepByStep = useCallback((pawnId, stepsLeft, onFinish, diceValue) => {
    // 🛡️ Lock board during animation
    setIsAnimating(true); // Keep existing setIsAnimating

    let didKill = false;
    let rolledValue = diceValue; // Use the passed value, not the state

    if (stepsLeft <= 0) {

      setPawns(prev => {

        const movedPawn = prev.find(p => p.id === pawnId);
        if (!movedPawn) return prev;

        // ===== HANDLE KILL =====
        if (movedPawn.pathIndex !== -1 && movedPawn.pathIndex >= 0 && movedPawn.pathIndex < MAIN_PATH.length) {

          const landedCoord = MAIN_PATH[movedPawn.pathIndex];

          const isSafe = SAFE_TILES.some(
            tile => tile.x === landedCoord.x && tile.y === landedCoord.y
          );

          const sameColorStack = prev.filter(
            p =>
              p.color === movedPawn.color &&
              p.pathIndex === movedPawn.pathIndex
          ).length;

          return prev.map(p => {

            if (p.id === pawnId) return p;
            if (isSafe) return p;
            if (sameColorStack >= 2) return p;

            if (p.pathIndex !== -1 && p.pathIndex >= 0 && p.pathIndex < MAIN_PATH.length) {
              const opponentCoord = MAIN_PATH[p.pathIndex];
              if (
                p.color !== movedPawn.color &&
                opponentCoord.x === landedCoord.x &&
                opponentCoord.y === landedCoord.y
              ) {
                didKill = true;
                // 🛑 DO NOT reset here anymore! animatePawnBackToBase will handle the visual retreat.
                // We keep it at its current position so there's no "jump" to home before the retreat starts.
                return p;
              }
            }

            return p;
          });
        }

        return prev;
      });

      setDice(null);
      setCanMove(false);

      setIsAnimating(false);
      // Trigger finish callback if provided
      if (onFinish) onFinish();
      return;
    }

    // Play move sound ONLY if we are actually taking a step
    playMoveSound();

    setPawns(prev =>
      prev.map(pawn => {
        if (pawn.id !== pawnId) return pawn;
        if (pawn.isFinished) return pawn;

        // ===== MOVE INSIDE HOME LANE =====
        if (pawn.homeIndex !== -1) {
          if (pawn.homeIndex + 1 > 4) {
            playEnterTriangleSound();
            return {
              ...pawn,
              homeIndex: 5,
              isFinished: true
            };
          }

          return {
            ...pawn,
            homeIndex: pawn.homeIndex + 1
          };
        }

        // ===== CHECK LANE ENTRY =====
        const completedRound = pawn.stepsTravelled + 1 > 50;

        if (completedRound) {
          return {
            ...pawn,
            pathIndex: -1,
            homeIndex: 0,
            stepsTravelled: pawn.stepsTravelled + 1
          };
        }

        // ===== NORMAL PATH MOVE =====
        const nextIndex =
          pawn.pathIndex === -1
            ? ENTRY_INDEX[normalizeColor(pawn.color)]
            : (pawn.pathIndex + 1 >= MAIN_PATH.length ? 0 : pawn.pathIndex + 1);

        return {
          ...pawn,
          pathIndex: nextIndex,
          stepsTravelled: pawn.pathIndex === -1 ? 0 : pawn.stepsTravelled + 1
        };
      })
    );

    // Recursive call for next step
    setTimeout(() => movePawnStepByStep(pawnId, stepsLeft - 1, onFinish, rolledValue), SPEED);
  }, [isLocalGame, isComputerGame, playMoveSound, playEnterTriangleSound]);

  const finalizeTurn = useCallback((newTurn, data) => {
    const { killed, killedPawnId, killedFromIndex } = data || {};
    const normalizedNewTurn = normalizeColor(newTurn);
    const oldTurn = normalizeColor(currentTurn);
    const isBonus = oldTurn === normalizedNewTurn && (data?.killed || dice === 6);

    console.log('🎁 Finalizing turn to:', normalizedNewTurn, isBonus ? '(BONUS TURN)' : '');

    // 🎲 ALWAYS clear dice after a move is finalized, 
    // especially for bonus turns (6s, kills) so the player/bot can roll again.
    setDice(null);

    setCurrentTurn(normalizedNewTurn);
    setCanMove(false);
    pendingTurn.current = null;

    if (killed && killedPawnId !== null) {
      animatePawnBackToBase(killedPawnId, killedFromIndex);
    }
  }, [gameId, animatePawnBackToBase, currentTurn]);

  // ========== SOCKET.IO REAL-TIME HANDLERS ==========

  // Handle incoming dice roll events from other players
  const handleDiceRolled = useCallback((data) => {
    console.log('🎲 Real-time dice roll received:', data);
    const { dice: rolledDice, current_turn: newTurn, hasMove, isAuto } = data;
    const normalizedNewTurn = normalizeColor(newTurn);

    // If we're not already rolling (remote player case), start the animation now
    if (!isRollingRef.current) {
      setIsRolling(true);
      playRollSound();
    }

    // 🚀 Ensure a minimum roll duration so all players see the spin
    setTimeout(() => {
      setDice(rolledDice);
      setIsRolling(false);

      // If no move possible, we need to transition to the next turn
      if (hasMove === false) {
        console.log("🚫 No valid moves possible. Turn will skip to:", normalizedNewTurn);
        // We update the state that triggers animations/UI later, 
        // but for logic purposes, we need to know the turn has changed.
        setTimeout(() => {
          setCurrentTurn(normalizedNewTurn);
          setDice(null);
          setCanMove(false);
          rollLock.current = false; // 🔓 Finally release lock when turn actually changes
        }, 1500); // UI delay for "unlucky" roll
      } else {
        setCanMove(true);
        rollLock.current = false; // 🔓 Release lock so they can eventually roll again (if 6/bonus)

        // 🤖 AUTO-ACTION: If this roll was triggered by timeout, move a pawn automatically
        if ((isAuto || isAutoActionRef.current) && hasMove) {
          console.log("🤖 Auto-action: Triggering automatic pawn move after timeout roll...");
          const myPawns = pawnsRefForTimeout.current.filter(p => normalizeColor(p.color) === normalizedNewTurn && !p.isFinished);
          const movablePawns = myPawns.filter(p => isPawnMovable(p, rolledDice));
          if (movablePawns.length > 0) {
            // Prioritize last moved pawn, then most advanced active pawn, then random
            let selectedPawn = movablePawns.find(p => p.id === lastMovedByMe.current);
            if (!selectedPawn) {
              const activePawns = movablePawns.filter(p => p.pathIndex !== -1);
              if (activePawns.length > 0) {
                activePawns.sort((a, b) => b.stepsTravelled - a.stepsTravelled);
                selectedPawn = activePawns[0];
              }
            }
            if (!selectedPawn) {
              selectedPawn = movablePawns[Math.floor(Math.random() * movablePawns.length)];
            }
            console.log("🤖 Auto-moving pawn ID:", selectedPawn.id);
            setTimeout(() => {
              if (handlePawnClickRef.current) {
                handlePawnClickRef.current(selectedPawn.id, true);
              }
            }, 600);
          }
        }
      }
    }, 600);
  }, [playRollSound]); // stable deps to avoid TDZ/circular-dependency issues

  const handleGameStateUpdated = useCallback((data) => {
    console.log('🔄 Game state synced:', data);
    if (!data.game || !data.pawns) return;

    // 🛡️ Filter out pawns of quit players
    const quitPlayerColors = (data.players || [])
      .filter(p => p.status === 'quit' || p.status === 'left')
      .map(p => normalizeColor(p.color));

    const formattedPawns = data.pawns
      .filter(pawn => !quitPlayerColors.includes(normalizeColor(pawn.color)))
      .map(pawn => ({
        id: pawn.id,
        color: normalizeColor(pawn.color),
        pathIndex: pawn.path_index ?? -1,
        homeIndex: pawn.home_index ?? -1,
        stepsTravelled: pawn.steps_travelled ?? 0,
        isFinished: pawn.is_finished === 1
      }));
    setPawns(formattedPawns);

    const turn = normalizeColor(data.game.current_turn);
    setCurrentTurn(turn);
    rollLock.current = false;
    isWaitingForSync.current = false;

    setDice(data.game.dice_value || null);
    if (!data.game.dice_value) setCanMove(false);

    if (data.game.winner) {
      setWinner(data.game.winner);
      setIsGameOver(true);
      isGameOverRef.current = true;

      const myNorm = myColor ? normalizeColor(myColor) : null;
      let winnerNorm = data.game.winner_color ? normalizeColor(data.game.winner_color) : null;

      // 🕵️ Deduce color if backend didn't provide it
      if (!winnerNorm && data.players) {
        const foundWinner = data.players.find(p => p.name === data.game.winner);
        if (foundWinner) winnerNorm = normalizeColor(foundWinner.color);
      }

      // Fallback: Check if the winner name matches local player name
      const localPlayerName = localStorage.getItem('ludo_player_name') || 'Player';
      const isMyWin = (myNorm && winnerNorm) ? (myNorm === winnerNorm) : (data.game.winner === localPlayerName);

      setGameResult(isMyWin ? 'win' : 'loss');

      if (isMyWin) playWinSound();

      const totalPlayersCount = data.players?.length || 4;
      const isPaidMatch = (!!gameId && !isLocalGame) || isComputerGame;
      const winAmount = totalPlayersCount === 2 ? 180 : 250;
      const runnerUpAmount = totalPlayersCount > 2 ? 100 : 0;

      // 🚀 Navigate to Results Page instead of overlay!
      setTimeout(() => {
        if (hasNavigatedAway.current) return;
        hasNavigatedAway.current = true;
        navigate('/results', {
          state: {
            winnerName: data.game.winner,
            winnerColor: winnerNorm,
            gameResult: isMyWin ? 'win' : 'loss',
            gameId: gameId,
            players: data.players,
            prizes: isPaidMatch ? {
              first: winAmount,
              second: runnerUpAmount
            } : null
          }
        });
      }, 3000);
    }

    if (data.players) {
      const names = {};
      const statuses = {};
      data.players.forEach(p => {
        const color = normalizeColor(p.color);
        names[color] = p.name;
        statuses[color] = p.status;
      });
      setPlayerNames(names);
      setPlayerStatuses(statuses);
      playerStatusesRef.current = statuses;

      const effectivePlayerName = (playerName || localStorage.getItem('ludo_player_name') || "").trim().toLowerCase();
      if (effectivePlayerName) {
        const colorData = data.players.find(p => (p.name || "").trim().toLowerCase() === effectivePlayerName);
        if (colorData) setMyColor(normalizeColor(colorData.color));
      }
    }
  }, [playerName, myColor, showResultOverlay, playWinSound]);

  const handleDiceRollError = useCallback((data) => {
    console.error("🎲 Dice roll error handler:", data);
    setIsRolling(false);
    rollLock.current = false; // 🔓 Release lock on error
  }, []);

  const handlePawnMoveError = useCallback((data) => {
    console.error("♛ Pawn move error handler:", data);
    isWaitingForSync.current = false;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
  }, []);

  // Handle incoming pawn move events from other players
  const handlePawnMoved = useCallback((data) => {
    const { pawnId, dice: diceValue, current_turn: newTurn, isEntry } = data;
    console.log('♛ Pawn move event received. nextTurn:', newTurn);

    // If it was my move, clear the sync barrier
    if (String(pawnId) === String(lastMovedByMe.current) || isWaitingForSync.current) {
      isWaitingForSync.current = false;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    }

    if (String(pawnId) === String(lastMovedByMe.current)) {
      lastMovedByMe.current = null;
    }

    // Move behavior (for all players)
    const targetPawn = pawnsRef.current.find(p => p.id == pawnId);
    const effectiveIsEntry = isEntry || (targetPawn && targetPawn.pathIndex === -1 && diceValue == 6);

    if (effectiveIsEntry) {
      playStartSound();
      setPawns(prev => prev.map(p =>
        p.id === pawnId
          ? { ...p, pathIndex: ENTRY_INDEX[normalizeColor(p.color)], homeIndex: -1, stepsTravelled: 0 }
          : p
      ));
      finalizeTurn(newTurn, data);
    } else {
      movePawnStepByStep(pawnId, diceValue, () => finalizeTurn(newTurn, data), diceValue);
    }
  }, [gameId, finalizeTurn, playStartSound, playMoveSound, movePawnStepByStep]);

  // Initialize socket connection
  const { requestDiceRoll, requestMovePawn, quitGame } = useSocket(gameId, {
    onDiceRolled: handleDiceRolled,
    onPawnMoved: handlePawnMoved,
    onGameStateUpdated: handleGameStateUpdated,
    onDiceRollError: handleDiceRollError,
    onGameOver: (data) => {
      console.log("🎁 Socket Game Over Event:", data);
      setIsGameOver(true);
      isGameOverRef.current = true;
      setWinner(data.winner);

      const myNorm = myColor ? normalizeColor(myColor) : null;
      let winnerNorm = data.winnerColor ? normalizeColor(data.winnerColor) : null;

      // 🕵️ Deduce color if missing
      if (!winnerNorm && playerNames) {
        winnerNorm = Object.keys(playerNames).find(c => playerNames[c] === data.winner);
      }

      setWinner(data.winner);
      setWinnerColor(normalizeColor(data.winnerColor));

      const isMyWin = (myNorm && winnerNorm) ? (myNorm === winnerNorm) : (data.winner === (playerName || localStorage.getItem('ludo_player_name')));

      setGameResult(isMyWin ? 'win' : 'loss');

      if (isMyWin) playWinSound();

      const totalPlayersCount = Object.keys(playerNames).length;
      const isPaidMatch = (!!gameId && !isLocalGame) || isComputerGame;
      const winAmount = totalPlayersCount === 2 ? 180 : 250;
      const runnerUpAmount = totalPlayersCount > 2 ? 100 : 0;

      // 🏆 Show the Cinematic Victory Overlay if I am the winner
      if (isMyWin) {
        setShowWinOverlay(true);
      }

      // 🚀 Navigate to Results Page!
      setTimeout(() => {
        if (hasNavigatedAway.current) return;
        setShowWinOverlay(false);
        hasNavigatedAway.current = true;
        navigate('/results', {
          state: {
            winnerName: data.winner,
            winnerColor: winnerNorm,
            gameResult: isMyWin ? 'win' : 'loss',
            gameId: gameId,
            players: Object.keys(playerNames).map(c => ({ name: playerNames[c], color: c })),
            rankings: data.rankings || [], // 🥇 Official Backend Ranking
            prizes: isPaidMatch ? {
              first: winAmount,
              second: runnerUpAmount
            } : null
          }
        });
      }, 4000);

    },
    onPawnMoveError: handlePawnMoveError,
    onPlayerQuit: (data) => {
      const isMe = myColor && normalizeColor(data.color) === normalizeColor(myColor);

      if (!isMe) {
        showNotification(`${data.name} has quit the game`, 'warning');
      }

      const quitColor = normalizeColor(data.color);
      // 🔥 Remove quitting player's pawns instantly for visual clarity
      setPawns(prev => prev.filter(p => normalizeColor(p.color) !== quitColor));

      // 🛑 REDIRECT HOME if it was ME who quit/disconnected/timed out
      // 🛡️ BUT ONLY if the game is NOT over. If game is over, we let the results handle it.
      if (isMe && !isGameOverRef.current && !hasNavigatedAway.current) {
        setTimeout(() => {
          if (hasNavigatedAway.current) return;
          hasNavigatedAway.current = true;
          navigate('/menu');
        }, 2000);
      }
    }
  }, myColor);

  const HandleRollDice = useCallback((isAuto = false) => {
    // 🛡️ SECURITY & LOCK: Only roll once
    console.log("🎲 Dice Clicked! ", {
      isAuto,
      currentTurn,
      myColor,
      isRolling: isRollingRef.current,
      canMove,
      dice,
      syncLocked: isWaitingForSync.current,
      rollLock: rollLock.current,
      gameId
    });

    if (isGameOver || rollLock.current) {
      console.warn(" Roll blocked: Game already over or rollLock is true");
      return;
    }

    //  LOCK IMMEDIATELY to prevent millisecond double-clicking
    rollLock.current = true;


    //  Computer mode security (only block if it's a manual click on bot turn)
    if (isComputerGame && isAuto !== true) {
      const isMyColor = myColor ? normalizeColor(currentTurn) === normalizeColor(myColor) : normalizeColor(currentTurn) === "#f44336";
      if (!isMyColor) {
        console.warn(" You cannot roll for the computer!");
        rollLock.current = false; //  Unlock
        return;
      }
    } else if (!isLocalGame) {
      //  Computer mode + Auto roll: Allow!
      if (isComputerGame && isAuto === true) {
        // Proceed but verify color still matches current turn
        const normalizedActual = normalizeColor(currentTurnRef.current);
        const normalizedToRoll = normalizeColor(currentTurn); // The turn when the bot logic started

        if (normalizedToRoll !== normalizedActual) {
          console.warn(" Bot roll canceled: Turn changed during 'thinking'", { expected: normalizedToRoll, actual: normalizedActual });
          rollLock.current = false; //  Unlock
          return;
        }
      } else {
        if (!myColor) {
          console.warn("🚫 Roll blocked: Still identifying your player color...");
          rollLock.current = false; //  Unlock
          return;
        }
        const normalizedTurn = normalizeColor(currentTurn);
        const normalizedMyColor = normalizeColor(myColor);

        if (isAuto !== true && normalizedTurn !== normalizedMyColor) {
          console.warn(" Security: You cannot roll for another player!", { currentTurn: normalizedTurn, myColor: normalizedMyColor });
          rollLock.current = false; //  Unlock
          return;
        }
      }
    }

    if (canMove || isRollingRef.current || isWaitingForSync.current || isAnimating) {
      console.warn("🚫 Roll blocked: State busy", { canMove, isRolling: isRollingRef.current, sync: isWaitingForSync.current, isAnimating });
      rollLock.current = false; //  Unlock
      return;
    }

    console.log(`🎲 Emitting request_roll_dice for ${currentTurn} in game ${gameId}...`);

    // 🚀 OPTIMISTIC UI: Start spinning immediately before server response
    setIsRolling(true);
    playRollSound();

    const sent = requestDiceRoll(currentTurn, isAuto);

    if (!sent) {
      console.error("❌ Dice roll emission failed (socket disconnected?)");
      rollLock.current = false;
      setIsRolling(false);
      return;
    }

    // 🛡️ SAFETY TIMEOUT: If no response in 1.5s, force unlock
    setTimeout(() => {
      if (isRollingRef.current || rollLock.current) {
        console.warn("🛡️ Safety Trigger: Forcing rollLock release due to timeout (no response from server).");
        rollLock.current = false;
        setIsRolling(false);
      }
    }, 1500);
  }, [currentTurn, dice, canMove, isComputerGame, isLocalGame, myColor, requestDiceRoll, gameId, isAnimating]);
  // Helper to determine if a pawn can make a valid move with the current dice
  const isPawnMovable = useCallback((pawn, currentDice) => {
    if (!currentDice || pawn.isFinished) return false;

    // Base pawn needs a 6
    if (pawn.pathIndex === -1 && pawn.homeIndex === -1) {
      return currentDice === 6;
    }

    // Home lane pawn cannot overshoot
    if (pawn.homeIndex !== -1) {
      return pawn.homeIndex + currentDice <= 5;
    }

    // Main path pawn cannot overshoot the total 56 steps required to finish
    if (pawn.stepsTravelled !== undefined && pawn.stepsTravelled + currentDice > 56) {
      return false;
    }

    return true;
  }, []);


  const handlePawnClick = useCallback((pawnId, isAuto = false) => {
    if (isGameOver || isAnimating || isWaitingForSync.current) {
      console.warn("🚫 Move blocked: Game over, Animation running, or waiting for sync");
      return;
    }


    const pawn = pawns.find(p => p.id === pawnId);
    if (!pawn || normalizeColor(pawn.color) !== normalizeColor(currentTurn)) {
      console.warn("🚫 Move blocked: Pawn not found or not your turn");
      return;
    }

    const normalizedPawnColor = normalizeColor(pawn.color);

    // 🛡️ SECURITY: Only allow move if it's your turn (except in VS Computer or Local Pass&Play)
    if (isComputerGame && !isAuto) {
      const isMyColor = myColor ? normalizeColor(currentTurn) === normalizeColor(myColor) : normalizeColor(currentTurn) === "#f44336";
      if (!isMyColor) {
        console.warn("🚫 You cannot move pawns for the computer!");
        return;
      }
    } else if (!isLocalGame) {
      if (isComputerGame && isAuto) {
        // Proceed for bot
      } else {
        if (!myColor) {
          console.warn("🚫 Still identifying your player color...");
          return;
        }
        const normalizedMyColor = normalizeColor(myColor);
        const normalizedTurn = normalizeColor(currentTurn);
        const normalizedPawnColor = normalizeColor(pawn.color);

        if (isAuto !== true && normalizedTurn !== normalizedMyColor) {
          console.warn("🚫 Security: You cannot move pawns when it is not your turn!");
          return;
        }
        if (isAuto !== true && normalizedPawnColor !== normalizedMyColor) {
          console.warn("🚫 Security: You cannot move someone else's pawn!");
          return;
        }
      }
    }

    if (dice === null || !canMove) {
      console.warn("🚫 Cannot move: Dice is null or canMove is false");
      return;
    }

    // 🛑 VALIDATION: Pawn in base needs a 6
    if (pawn.pathIndex === -1 && pawn.homeIndex === -1) {
      if (dice !== 6) {
        console.warn("🚫 Need 6 to enter from base");
        return;
      }
    }

    // 🛑 VALIDATION: Home lane overshoot
    if (pawn.homeIndex !== -1) {
      if (Number(pawn.homeIndex) + Number(dice) > 5) {
        console.warn("🚫 Overshoot! Cannot move this pawn.");
        return;
      }
    }

    console.log(`♛ Requesting move for pawn ${pawnId}...`);
    lastMovedByMe.current = pawnId;
    isWaitingForSync.current = true;
    startSyncTimeout();

    const sent = requestMovePawn(pawnId);
    if (!sent) {
      isWaitingForSync.current = false;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    }
  }, [dice, canMove, currentTurn, myColor, isLocalGame, isComputerGame, pawns, requestMovePawn, startSyncTimeout, isAnimating]);

  // Keep handlePawnClickRef.current updated on every render
  handlePawnClickRef.current = handlePawnClick;








  const Star = ({ cx, cy, hasBorder = true }) => (
    <polygon
      points={`
      ${cx},${cy - 0.3} 
      ${cx + 0.08},${cy - 0.08} 
      ${cx + 0.3},${cy - 0.08} 
      ${cx + 0.12},${cy + 0.05} 
      ${cx + 0.2},${cy + 0.3} 
      ${cx},${cy + 0.15} 
      ${cx - 0.2},${cy + 0.3} 
      ${cx - 0.12},${cy + 0.05} 
      ${cx - 0.3},${cy - 0.08} 
      ${cx - 0.08},${cy - 0.08}
    `}
      fill="#fff"
      stroke={hasBorder ? "#ddd" : "none"}
      strokeWidth="0.05"
    />
  );



  const getGameState = async () => {
    try {
      const data = await fetchGameState(gameId);
      console.log(data)
      // setGameState(data);


      if (data && data.game) {
        setCurrentTurn(normalizeColor(data.game.current_turn));
        rollLock.current = false;
        isWaitingForSync.current = false;
        setDice(data.game.dice_value || null);
        if (!data.game.dice_value) setCanMove(false);

        // Timer Sync: Pick up remaining time from server
        // Use remaining_seconds if it exists (from the new SQL calculation)
        const serverRemaining = data.game.remaining_seconds !== undefined ? data.game.remaining_seconds : data.game.remainingTimeSeconds;
         if(serverRemaining>0) setTimeLeft(serverRemaining)
        
      }

      if (data && data.players) {
        const names = {};
        const statuses = {};
        const initialLives = { ...playerLives };

        data.players.forEach(p => {
          const normColor = normalizeColor(p.color);
          names[normColor] = p.name;
          statuses[normColor] = p.status;

          //  Life Sync: Ensure we pick up lives correctly, defaulting to 5
          const serverLives = (p.lives !== undefined && p.lives !== null) ? Number(p.lives) : 5;
          initialLives[normColor] = serverLives;
        });
        setPlayerNames(names);
        setPlayerStatuses(statuses);
        setPlayerLives(initialLives);

        // Check if game is already over
        if (data.game && data.game.winner) {
          setWinner(data.game.winner);
          setIsGameOver(true);
          isGameOverRef.current = true;
          const myNorm = playerColor ? normalizeColor(playerColor) : null;
          let winnerNorm = data.game.winner_color ? normalizeColor(data.game.winner_color) : null;
          if (!winnerNorm) {
            const foundWinner = data.players.find(p => p.name === data.game.winner);
            if (foundWinner) winnerNorm = normalizeColor(foundWinner.color);
          }
          const localPlayerName = localStorage.getItem('ludo_player_name') || 'Player';
          const isMyWin = (myNorm && winnerNorm) ? (myNorm === winnerNorm) : (data.game.winner === localPlayerName);
          setGameResult(isMyWin ? 'win' : 'loss');

          const totalPlayersCount = data.players?.length || 4;
          const isPaidMatch = (!!gameId && !isLocalGame) || isComputerGame;
          const winAmount = totalPlayersCount === 2 ? 180 : 250;
          const runnerUpAmount = totalPlayersCount > 2 ? 100 : 0;

          setTimeout(() => {
            if (hasNavigatedAway.current) return;
            hasNavigatedAway.current = true;
            navigate('/results', {
              state: {
                winnerName: data.game.winner,
                winnerColor: winnerNorm,
                gameResult: isMyWin ? 'win' : 'loss',
                gameId: gameId,
                players: data.players,
                prizes: isPaidMatch ? {
                  first: winAmount,
                  second: runnerUpAmount
                } : null
              }
            });
          }, 1500);
          return; // Stop further setup
        }

        // Filter out pawns of quit players immediately
        const quitColors = data.players
          .filter(p => p.status === 'quit' || p.status === 'left')
          .map(p => normalizeColor(p.color));

        if (data.pawns) {
          const formattedPawns = data.pawns
            .filter(p => !quitColors.includes(normalizeColor(p.color)))
            .map(pawn => ({
              id: pawn.id,
              color: normalizeColor(pawn.color),
              pathIndex: pawn.path_index ?? -1,
              homeIndex: pawn.home_index ?? -1,
              stepsTravelled: pawn.steps_travelled ?? 0,
              isFinished: pawn.is_finished === 1
            }));
          setPawns(formattedPawns);
        }

        // Identify local player color
        if (playerColor) {
          setMyColor(normalizeColor(playerColor));
        } else {
          const effectivePlayerName = (playerName || localStorage.getItem('ludo_player_name') || "").trim().toLowerCase();
          if (effectivePlayerName && data.players && !isLocalGame) {
            const colorObj = data.players.find(p => (p.name || "").trim().toLowerCase() === effectivePlayerName);
            if (colorObj) {
              setMyColor(normalizeColor(colorObj.color));
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch initial game state:", err);
    } finally {
      // Small delay for smooth transition
      setTimeout(() => {
        setIsLoading(false);
        if (location.state?.isWorldwide) {
          showNotification(`Match Started! You are assigned ${playerColor === '#f44336' ? 'Red' : playerColor === '#4caf50' ? 'Green' : playerColor === '#fad416' ? 'Yellow' : 'Blue'}.`, 'success');
          playStartSound();
        }
      }, 1000);
    }

    // setPawns(data.pawns);
    // setCurrentTurn(data.game.current_turn);
  }

  useEffect(() => {
    if (gameId) {
      getGameState();
    }
  }, [gameId]);

  // Check for winners and game end
  useEffect(() => {
    const finishedColors = Object.keys(playerNames).filter(color =>
      pawns.filter(p => normalizeColor(p.color) === normalizeColor(color) && p.isFinished).length === 4
    );

    let currentFinishedOrder = [...finishedOrder];

    // Update finished order if someone new finished
    if (finishedColors.length > finishedOrder.length) {
      const newWinners = finishedColors.filter(c => !finishedOrder.includes(c));
      if (newWinners.length > 0) {
        currentFinishedOrder = [...finishedOrder, ...newWinners];
        setFinishedOrder(currentFinishedOrder);

        // Check if this player finished all 4
        if (newWinners.length > 0) {
          playWinSound();
          if (!winner) {
            setWinner(playerNames[newWinners[0]]);
            setWinnerColor(newWinners[0]);
          }
        }
      }
    }

    const totalPlayers = Object.keys(playerNames).length;
    const activePlayers = Object.keys(playerStatuses).filter(c => playerStatuses[c] === 'active');

    // Check if MY game is over (I finished OR I am the only one left)
    const myNormalizedColor = myColor ? normalizeColor(myColor) : null;
    const isMeFinished = myNormalizedColor && finishedColors.includes(myNormalizedColor);
    const myStatus = myNormalizedColor ? playerStatuses[myNormalizedColor] : null;

    // A player is "still playing" if they are active and have NOT finished all their pawns
    const playersStillPlaying = activePlayers.filter(c => !finishedColors.includes(normalizeColor(c)));
    const otherPlayersStillPlaying = playersStillPlaying.filter(c => normalizeColor(c) !== myNormalizedColor);

    const amILastOneLeft = (myStatus === 'active') && (otherPlayersStillPlaying.length === 0) && (totalPlayers > 1);

    // 🎁 GAME OVER CALCULATION (Local/Computer games only)
    // 🌎 For Online games, we wait for the server's 'game_over' event to ensure all ranks are decided
    if ((isLocalGame || isComputerGame) && totalPlayers >= 2 && !showResultOverlay) {
      if (isMeFinished || amILastOneLeft) {
        console.log("🎁 My Game is OVER! Calculating Rankings immediately...");
        setShowResultOverlay(true); // act as flag that we have handled the game over

        // Calculate rankings
        const results = Object.keys(playerNames).map(color => {
          const normColor = normalizeColor(color);
          const finishIndex = currentFinishedOrder.indexOf(normColor);
          const status = playerStatuses[normColor] || 'quit';

          let score = 0;
          const playerPawns = pawns.filter(p => normalizeColor(p.color) === normColor);
          playerPawns.forEach(p => {
            score += p.stepsTravelled || 0;
            if (p.isFinished) score += 100;
          });

          return {
            color: normColor,
            name: playerNames[color],
            status,
            finishIndex,
            score
          };
        });

        results.sort((a, b) => {
          // 1. Finished players first
          if (a.finishIndex !== -1 && b.finishIndex !== -1) return a.finishIndex - b.finishIndex;
          if (a.finishIndex !== -1) return -1;
          if (b.finishIndex !== -1) return 1;

          // 2. Active players second
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (b.status === 'active' && a.status !== 'active') return 1;

          // 3. Fallback to score
          return b.score - a.score;
        });
        const rankedResults = results.map((r, i) => ({ ...r, rank: i + 1 }));

        const myRank = rankedResults.find(r => r.color === myNormalizedColor)?.rank || 4;
        const myGameResult = myRank === 1 ? 'win' : 'loss';

        const isPaidMatch = (!!gameId && !isLocalGame) || isComputerGame;
        const totalPlayersCount = Object.keys(playerNames).length;
        const winAmount = totalPlayersCount === 2 ? 180 : 250;
        const runnerUpAmount = totalPlayersCount > 2 ? 100 : 0;

        // 💰 REWARD COINS (Client-side for Computer only - Online matches now handled server-side)
        if (isComputerGame && (myRank === 1 || myRank === 2)) {
          const user = JSON.parse(localStorage.getItem('ludo_user') || '{}');
          if (user.id) {
            let winningAmount = 0;
            if (myRank === 1) winningAmount = winAmount;
            else if (myRank === 2) winningAmount = runnerUpAmount;

            if (winningAmount > 0) {
              console.log(`🥇 Matches Reward: Providing ${winningAmount} coins for Rank ${myRank}`);
              rewardCoinsFun(user.id, winningAmount);
            }
          }
        }

        setGameResult(myGameResult);
        if (myGameResult === 'win') {
          playWinSound();
          setShowWinOverlay(true);
        }
        setIsGameOver(true);
        isGameOverRef.current = true;

        setTimeout(() => {
          if (hasNavigatedAway.current) return;
          setShowWinOverlay(false);
          hasNavigatedAway.current = true;
          navigate('/results', {
            state: {
              winnerName: playerNames[rankedResults[0].color],
              winnerColor: rankedResults[0].color,
              gameResult: myGameResult,
              gameId,
              players: Object.keys(playerNames).map(c => ({ name: playerNames[c], color: c })),
              rankings: rankedResults,
              isComputerGame,
              isLocalGame,
              prizes: isPaidMatch ? {
                first: winAmount,
                second: runnerUpAmount
              } : null
            }
          });
        }, 4000);
      }
    }

    // 🛑 REDIRECT HOME if I am disqualified/quit
    if (myColor && playerStatuses[normalizeColor(myColor)] === 'quit' && !isGameOverRef.current && !hasNavigatedAway.current) {
      console.log("🛑 Disqualification check: I am marked as 'quit'. Redirecting...");
      setTimeout(() => {
        if (hasNavigatedAway.current) return;
        hasNavigatedAway.current = true;
        navigate('/menu');
      }, 2000);
    }
  }, [pawns, playerNames, finishedOrder, navigate, playerStatuses, winner, myColor, showResultOverlay]);

  // 🤖 AUTO-MOVE: If only 1 pawn can move (OR all movable pawns are at the same spot), move it automatically
  useEffect(() => {
    // 🛡️ Online Security (and AI safety): Only auto-move if it's MY turn
    const isBotTurn = isComputerGame && (myColor ? normalizeColor(currentTurn) !== normalizeColor(myColor) : normalizeColor(currentTurn) !== "#f44336");
    const isMyTurn = (isLocalGame || isComputerGame || (myColor && currentTurn === myColor)) && !isBotTurn;

    if (!isMyTurn) return;

    if (dice && canMove && !isRolling && !isAnimating && !isWaitingForSync.current) {
      const myPawns = pawns.filter(p => normalizeColor(p.color) === normalizeColor(currentTurn) && !p.isFinished);
      const movablePawns = myPawns.filter(p => isPawnMovable(p, dice));

      // Group movable pawns by their current position
      const uniquePositions = new Set(movablePawns.map(p => `${p.pathIndex},${p.homeIndex}`));

      // If there's only one "unique" choice, auto-move!
      // 🚨 EXCEPTION: Don't auto-open from base unless ALL your remaining pawns are in base.
      const allInBase = myPawns.every(p => p.pathIndex === -1 && p.homeIndex === -1);
      const isBaseMove = movablePawns[0]?.pathIndex === -1 && movablePawns[0]?.homeIndex === -1;

      if (movablePawns.length > 0 && uniquePositions.size === 1 && (!isBaseMove || allInBase)) {
        console.log("🤖 Auto-moving (single unique choice):", movablePawns[0].id);
        const timer = setTimeout(() => {
          handlePawnClick(movablePawns[0].id, true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [dice, canMove, isRolling, pawns, currentTurn, handlePawnClick, isLocalGame, isComputerGame, myColor, isAnimating]);


  //  AI TURN HANDLER
  useEffect(() => {
    if (!isComputerGame || !currentTurn || isLoading || isAnimating || isWaitingForSync.current) return;

    // Is it a computer's turn?
    const normalizedTurn = normalizeColor(currentTurn);
    const normalizedMyColor = myColor ? normalizeColor(myColor) : "#f44336";
    // Bot turn is if it's NOT the local player's color
    const isBotTurn = normalizedTurn !== normalizedMyColor;

    if (isBotTurn) {
      // 🎲 Case 1: Bot needs to roll
      if (dice === null && !isRolling && !isAnimating && !isWaitingForSync.current && !rollLock.current) {
        console.log("🎲 Bot thinking about roll...", normalizedTurn);
        const rollTimer = setTimeout(() => {
          HandleRollDice(true); // 🤖 Auto-roll
        }, 800); // ⚡ Increased for server/UI sync
        return () => clearTimeout(rollTimer);
      }

      // ♛ Case 2: Bot has rolled and needs to move
      else if (canMove && dice !== null && !isRolling && !isAnimating && !isWaitingForSync.current && !rollLock.current) {
        console.log("♛ Bot thinking about move... current turn:", normalizedTurn, "dice:", dice);

        // 🧠 AI BRAIN: Scoring System
        const getPawnRisk = (pIndex) => {
          if (pIndex === -1) return 0; // Safe in base
          // Check if it's a safe tile
          const coords = MAIN_PATH[pIndex];
          const isSafe = coords && SAFE_TILES.some(s => s.x === coords.x && s.y === coords.y);
          if (isSafe) return 0;

          let risk = 0;
          pawnsRef.current.forEach(op => {
            if (normalizeColor(op.color) === normalizedTurn) return;
            if (op.pathIndex === -1 || op.homeIndex !== -1 || op.isFinished) return;

            // Distance check on circular path
            const dist = (pIndex - op.pathIndex + 52) % 52;
            if (dist >= 1 && dist <= 6) {
              risk += (7 - dist); // Higher risk if closer
            }
          });
          return risk;
        };

        const isSix = dice === 6;

        const moveTimer = setTimeout(() => {
          const botPawns = pawnsRef.current.filter(p => normalizeColor(p.color) === normalizedTurn && !p.isFinished);
          const movablePawns = botPawns.filter(p => {
            if (p.pathIndex === -1 && p.homeIndex === -1) return dice === 6;
            if (p.homeIndex !== -1) return p.homeIndex + (dice || 0) <= 5;
            return true;
          });

          if (movablePawns.length > 0) {
            const scoredMoves = movablePawns.map(p => {
              let score = 0;
              const isBase = p.pathIndex === -1 && p.homeIndex === -1;
              const currentPathIndex = p.pathIndex;
              const totalSteps = p.stepsTravelled + dice;
              const isEnteringHome = totalSteps > 50;

              // 1. FINISH PRIORITY (Highest)
              if (p.homeIndex !== -1 && p.homeIndex + dice === 5) score += 2000;

              // 2. KILL PRIORITY
              if (!isBase && p.homeIndex === -1 && !isEnteringHome) {
                const targetIndex = (p.pathIndex + dice) % 52;
                const targetCoords = MAIN_PATH[targetIndex];
                const isTargetSafe = targetCoords && SAFE_TILES.some(s => s.x === targetCoords.x && s.y === targetCoords.y);

                if (!isTargetSafe) {
                  const opponentToKill = pawnsRef.current.find(op =>
                    normalizeColor(op.color) !== normalizedTurn &&
                    op.pathIndex === targetIndex &&
                    !op.isFinished
                  );
                  if (opponentToKill) score += 1500;
                }
              }

              // 3. ESCAPE RISK EVALUATION
              const currentRisk = getPawnRisk(currentPathIndex);
              let nextRisk = 0;
              if (isEnteringHome) {
                nextRisk = 0; // Safe in home lane
              } else if (isBase) {
                nextRisk = getPawnRisk(ENTRY_INDEX[normalizedTurn]);
              } else {
                nextRisk = getPawnRisk((p.pathIndex + dice) % 52);
              }

              if (currentRisk > 0 && nextRisk === 0) {
                score += 800; // Efficiently escaped to a safe spot!
              } else if (currentRisk > nextRisk) {
                score += 500; // Reduced risk
              } else if (nextRisk > currentRisk) {
                score -= 400; // Moving into danger
              }

              // 4. OPENING PRIORITY
              if (isBase && dice === 6) {
                const pawnsOut = botPawns.filter(bp => bp.pathIndex !== -1 || bp.homeIndex !== -1).length;
                score += (600 - (pawnsOut * 150)); // More urgent if few pawns are out
              }

              // 5. HOME LANE ENTRY
              if (!isBase && isEnteringHome && p.homeIndex === -1) score += 700;

              // 6. PROGRESS (Tie-breaker)
              score += p.stepsTravelled;

              return { pawn: p, score };
            });

            // Sort by score descending
            scoredMoves.sort((a, b) => b.score - a.score);
            const targetPawn = scoredMoves[0].pawn;

            console.log("♛ Bot Brain Result:", scoredMoves.map(m => `Pawn-${m.pawn.id}: ${m.score}`).join(', '));
            console.log("♛ Bot selected pawn:", targetPawn.id, "Score:", scoredMoves[0].score);

            handlePawnClick(targetPawn.id, true);
          } else {
          }
        }, isSix ? 1200 : 800); // 🕒 Slightly longer delay for 6 to show the move before the next roll
        return () => clearTimeout(moveTimer);
      }
    }
  }, [currentTurn, dice, canMove, isRolling, isComputerGame, isLoading, myColor, isAnimating]);

  // ⏰ AUTO-ACTION TIMER
  const isInitialTimerSync = useRef(true);
  useEffect(() => {
    if (!currentTurn || finishedOrder.includes(currentTurn)) return;

    if (isInitialTimerSync.current) {
      isInitialTimerSync.current = false;
      return;
    }

    // Reset timer only when turn actually changes OR dice is rolled/reset
    setTimeLeft(MAX_TIME);
    timerSoundRef.current.pause();
    timerSoundRef.current.currentTime = 0;
  }, [currentTurn, dice]);

  useEffect(() => {
    if (!currentTurn || finishedOrder.includes(currentTurn)) return;

    // 🛡️ Online Security: Only run the interval logic if it's MY turn (or local/computer)
    const isBotTurn = isComputerGame && (myColor ? normalizeColor(currentTurn) !== normalizeColor(myColor) : normalizeColor(currentTurn) !== "#f44336");
    const isMyTurn = isLocalGame || isComputerGame || (myColor && currentTurn === myColor);

    // 🕵️ Arbitrator Logic (FOR UNINTERRUPTED PLAY):
    // 1. If it's MY turn, I am my own arbitrator.
    // 2. If it's NOT my turn, the "first" other active player (alphabetically) becomes the backup arbitrator. 
    //    This ensures that even if the primary player is disconnected, someone else is watching.
    const activeColorsList = Object.keys(playerStatuses).filter(c => playerStatuses[c] === 'active').sort();
    const othersActive = activeColorsList.filter(c => normalizeColor(c) !== normalizeColor(currentTurn));
    const isArbitrator = isLocalGame || isComputerGame || (myColor && (
      (normalizeColor(currentTurn) === normalizeColor(myColor)) ||
      (othersActive.length > 0 && normalizeColor(othersActive[0]) === normalizeColor(myColor))
    ));

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;

        // When time runs out, trigger auto-action ONLY IF it is my turn OR I am the arbitrator for a stuck player
        if (newTime <= 0) {
          if (isMyTurn || (isArbitrator && !isBotTurn)) {
            console.log(isMyTurn ? "⏰ My time's up!" : `⏰ Arbitrating timeout for stuck player ${currentTurn}`);

            // Only play sound if it's MY turn
            if (isMyTurn) playTimerSound();

            setTimeout(() => {
              timerSoundRef.current.pause();
              timerSoundRef.current.currentTime = 0;

              if (dice === null && !isRolling) {
                console.log("⏰ Time's up! Auto-rolling dice...");
                isAutoActionRef.current = true; // Mark as automated
                HandleRollDice(true);
              } else if (canMove && !isAnimating && !isWaitingForSync.current) {
                console.log("⏰ Time's up! Auto-moving random pawn...");
                const myPawns = pawnsRefForTimeout.current.filter(p => normalizeColor(p.color) === normalizeColor(currentTurn) && !p.isFinished);
                const movablePawns = myPawns.filter(p => isPawnMovable(p, dice));

                if (movablePawns.length > 0) {
                  const randomPawn = movablePawns[Math.floor(Math.random() * movablePawns.length)];
                  handlePawnClick(randomPawn.id, true); // 🤖 Pass true for isAuto
                }
              }

              // 💀 LIFE SYSTEM LOSS (Humans only)
              if (!isBotTurn) {
                const currentLives = playerLives[normalizeColor(currentTurn)] || MAX_LIVES;
                const nextLives = currentLives - 1;

                if (nextLives <= 0) {
                  console.warn(`💀 DISQUALIFIED: Player ${currentTurn} lost all lives!`);
                  // If it's the current player's client, they quit as usual
                  if (myColor && normalizeColor(currentTurn) === normalizeColor(myColor)) {
                    showNotification("You ran out of time! You are disqualified.", "error");
                    quitGame(myColor);
                    setTimeout(() => navigate('/menu'), 3000);
                  }
                  // If I am the arbitrator, I notify the server to quit them
                  else if (isArbitrator) {
                    console.log("📢 Arbitrator: Kicking inactive player via socket...");
                    socket.emit('quit_game', { gameId, color: currentTurn });
                  }
                } else {
                  // Local notification for the player who timed out
                  if (myColor && normalizeColor(currentTurn) === normalizeColor(myColor)) {
                    showNotification("You ran out of time, One life lost", "warning");
                  }

                  // Arbitrator or the player themselves updates the lives
                  socket.emit('update_lives', { gameId, color: currentTurn, lives: nextLives });
                  setPlayerLives(prev => ({ ...prev, [normalizeColor(currentTurn)]: nextLives }));
                }
              }
            }, 100);
          }
          return MAX_TIME;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn, dice, isRolling, isLocalGame, isComputerGame, myColor, HandleRollDice, handlePawnClick, canMove, pawns]);

  // 🔊 Timer Sound Effect Controller
  useEffect(() => {
    // Only play if it's a real turn, time is low, and NOT currently rolling/moving
    if (timeLeft <= 10 && timeLeft > 0 && !isRolling && !isAnimating && !isLoading) {
      if (lastTimerTick.current !== timeLeft) {
        playTimerSound();
        lastTimerTick.current = timeLeft;
      }
    }
    // Cleanup if timeLeft becomes 0 or resets
    if (timeLeft === 0 || timeLeft === MAX_TIME) {
      timerSoundRef.current.pause();
      timerSoundRef.current.currentTime = 0;
      lastTimerTick.current = -1;
    }
  }, [timeLeft, isRolling, isLoading]);






  const TurnArrow = ({ side }) => (
    <div className={`${classes.turnArrow} ${side === 'left' ? classes.arrowLeft : classes.arrowRight}`}>
      <svg className={classes.arrowSvg} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#ff9800" />
          </linearGradient>
        </defs>
        <path
          className={classes.arrowMain}
          d="M20,8 L12,8 L12,4 L4,12 L12,20 L12,16 L20,16 Z"
          fill="url(#arrowGrad)"
        />
      </svg>
    </div>
  );

  const RepresentativePawn = ({ color }) => {
    const gradId = color === "#f44336" ? "gradRed" : color === "#4caf50" ? "gradGreen" : color === "#2196f3" ? "gradBlue" : "gradYellow";
    return (
      <svg width="30" height="30" viewBox="0 0 1 1">
        {/* 1. Base Disk for 3D Depth */}
        <circle cx="0.5" cy="0.65" r="0.45" fill="rgba(0,0,0,0.2)" />
        <circle cx="0.5" cy="0.6" r="0.45" fill="#eee" />
        <circle cx="0.5" cy="0.6" r="0.45" fill={color} opacity={0.3} />

        {/* 2. Rim */}
        <circle cx="0.5" cy="0.5" r="0.42" fill="#fff" />

        {/* 3. Body */}
        <circle cx="0.5" cy="0.5" r="0.38" fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.1)" strokeWidth="0.02" />

        {/* 4. Bezel */}
        <circle cx="0.5" cy="0.5" r="0.32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.03" />

        {/* 5. STAR ICON (Rotating) */}
        <path
          className={pawnClasses.starIcon}
          d="M 0.5 0.28 L 0.56 0.42 L 0.72 0.42 L 0.6 0.52 L 0.66 0.68 L 0.5 0.58 L 0.34 0.68 L 0.4 0.52 L 0.28 0.42 L 0.44 0.42 Z"
          fill="#fff"
          opacity="0.95"
        />

        {/* Top Gloss */}
        <ellipse cx="0.35" cy="0.35" rx="0.12" ry="0.08" fill="rgba(255,255,255,0.4)" transform="rotate(-45 0.35 0.35)" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.loadingContent}>
          <div className={classes.mainSpinner}></div>
          <h2 className={classes.loadingTitle}>Loading Game...</h2>
          <p className={classes.loadingSubtitle}>Synchronizing board state...</p>
        </div>
      </div>
    );
  }

  // 👥 Dynamic Player Distribution Logic (Self-Centric Rotation)
  // Position Mapping: [Bottom-Left, Top-Left, Top-Right, Bottom-Right]
  const slotOrder = ["#2196f3", "#f44336", "#4caf50", "#fad416"];

  let rotatedSlots = [...slotOrder];
  let boardRotation = 0;

  if (myColor) {
    const myIndex = slotOrder.indexOf(myColor);
    if (myIndex !== -1) {
      // Rotation angle to put myColor at Bottom-Left position of board
      boardRotation = -myIndex * 90;

      // Rotate slots for UI panels (so myColor is always bottom-most in panels)
      for (let i = 0; i < myIndex; i++) {
        rotatedSlots.push(rotatedSlots.shift());
      }
    }
  }

  // Slots 0 & 3 (Bottom-Left, Bottom-Right) go to bottom row
  // Slots 1 & 2 (Top-Left, Top-Right) go to top row
  const renderPlayerTab = (color, position) => {
    const normalizedColor = color ? normalizeColor(color) : null;
    // CRITICAL: Filter out any player who isn't actually in the current game session
    if (!normalizedColor || !playerNames[normalizedColor] || playerStatuses[normalizedColor] === 'quit' || !Object.keys(playerNames).includes(normalizedColor)) {
      return <div key={position} className={classes.emptySlot}></div>;
    }

    const isCurrentTurn = normalizeColor(currentTurn) === normalizedColor;
    const normalizedMyColor = myColor ? normalizeColor(myColor) : "#f44336";
    const isMe = myColor && normalizedColor === normalizedMyColor;

    const playerMessages = floatingMessages.filter(m => normalizeColor(m.color) === normalizedColor);

    return (
      <div
        key={color}
        className={`${classes.playerInfo} ${isCurrentTurn ? `${classes.activePlayer} ${normalizedColor === "#f44336" ? classes.activeRed : normalizedColor === "#4caf50" ? classes.activeGreen : normalizedColor === "#2196f3" ? classes.activeBlue : classes.activeYellow}` : ""}`}
        style={{ flexDirection: position === 'right' ? 'row-reverse' : 'row' }}
      >
        {isCurrentTurn && !canMove && !isRolling && !isAnimating && <TurnArrow side={position === 'right' ? 'right' : 'left'} />}
        {(isMe && (!isLocalGame || location.state?.isWorldwide) && !isComputerGame) && (
          <button
            className={classes.chatTrigger}
            onClick={() => setIsChatOpen(true)}
            title="Open Chat"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
            {unreadCount > 0 && !isChatOpen && (
              <span className={classes.unreadBadge}>{unreadCount}</span>
            )}
          </button>
        )}
        {(!isMe && !isLocalGame && !isComputerGame) && (
          <button
            className={classes.giftTrigger}
            onClick={() => openGiftDrawer(normalizedColor)}
            title="Send Gift"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36 2.38 3.24L17 10.83 14.92 8H20v6z" />
            </svg>
          </button>
        )}
        <div ref={el => playerRefs.current[normalizedColor] = el} className={classes.pawnContainer}>
          <RepresentativePawn color={color} />

          {activeStickers[normalizedColor] && (
            <div className={classes.stickerPopup}>
              {activeStickers[normalizedColor]}
            </div>
          )}
        </div>

        {/* ðŸ·ï¸ Player Name Label Removed as per user request */}

        <div className={classes.diceTab}>
          {/* 💀 LIVES METER (5 DOTS) ABOVE DICE */}
          <div className={classes.livesMeter}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`${classes.lifeDot} ${i < (playerLives[normalizedColor] || 5) ? classes.activeDot : classes.lostDot}`}
              />
            ))}
          </div>
          <Dice
            value={isCurrentTurn ? dice : null}
            color={color}
            isActive={isCurrentTurn && !isRolling && !canMove && !isAnimating && (isLocalGame || isMe) && dice === null}
            isRolling={isCurrentTurn && isRolling}
            onRoll={HandleRollDice}
            isVisible={isCurrentTurn}
          />
        </div>
      </div>
    );
  };

  // 🎯 Render Chat Bubbles in Board Corners
  const renderBoardBubbles = (slotIndex) => {
    const color = rotatedSlots[slotIndex];
    if (!color) return null;
    const normalizedColor = normalizeColor(color);
    const messages = floatingMessages.filter(m => normalizeColor(m.color) === normalizedColor);
    if (messages.length === 0) return null;

    const cornerClass = [classes.corner_bl, classes.corner_tl, classes.corner_tr, classes.corner_br][slotIndex];

    return (
      <div className={`${classes.boardChatContainer} ${cornerClass}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={classes.boardBubble}>
            {msg.text}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={classes.boardWrapper}>
      {/* 🚀 FLYING STICKER LAYER (Profile to Profile) */}
      {flyingStickers.map(sticker => (
        <div
          key={sticker.id}
          className={classes.flyingSticker}
          style={{
            '--startX': `${sticker.startX}px`,
            '--startY': `${sticker.startY}px`,
            '--endX': `${sticker.endX}px`,
            '--endY': `${sticker.endY}px`,
          }}
        >
          {STICKERS.find(s => s.id === sticker.giftId)?.emoji}
        </div>
      ))}

      {/* ðŸŽ STICKER DRAWER (TOP-DOWN) */}
      <div className={`${classes.giftDrawer} ${isGiftingOpen ? classes.giftDrawerOpen : ''}`}>
        <div className={classes.drawerHeader}>
          <h3>Send Sticker to {playerNames[giftTarget] || 'Player'}</h3>
          <button className={classes.closeDrawer} onClick={() => setIsGiftingOpen(false)}>Ã—</button>
        </div>
        <div className={classes.stickerGrid}>
          {STICKERS.map(sticker => (
            <button
              key={sticker.id}
              className={classes.stickerItem}
              onClick={() => handleSendGift(sticker.id)}
            >
              <span className={classes.stickerEmoji}>{sticker.emoji}</span>
              <div className={classes.stickerCost}>
                <span className={classes.coinIcon}>💰</span>
                {sticker.cost}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* â° TIMER SECTION */}
      <div className={classes.timerSection}>
        <div className={classes.timerContainer}>
          <div
            className={`${classes.timerBar} ${timeLeft < 5 ? classes.timerWarning : ""}`}
            style={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
          />
        </div>
        <div className={`${classes.timerText} ${timeLeft < 5 ? classes.timerWarningPulse : ""}`}>
          {timeLeft}s
        </div>
        <div
          className={classes.soundIndicator}
          onClick={toggleAllSounds}
          title={isSfxMuted && isMusicMuted ? "All Sounds Muted" : "All Sounds Enabled"}
        >
          {isSfxMuted && isMusicMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
          )}
        </div>
        {(!isLocalGame || location.state?.isWorldwide) && !isComputerGame && (
          <button
            className={classes.chatButtonTop}
            onClick={() => setIsChatOpen(true)}
            title="Chat"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
            {unreadCount > 0 && !isChatOpen && (
              <span className={classes.unreadBadgeTop}>{unreadCount}</span>
            )}
          </button>
        )}
        <button
          className={classes.settingsButton}
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84a.483.483 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 00-.59.22l-1.92 3.32a.49.49 0 00.12.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.27.41.48.41h3.84c.21 0 .43-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.07.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>
      </div>

      {/* âš™ï¸ SETTINGS MODAL */}
      {showSettings && (
        <div className={classes.settingsOverlay} onClick={() => setShowSettings(false)}>
          <div className={classes.settingsModal} onClick={e => e.stopPropagation()}>
            <h2 className={classes.settingsTitle}>Settings</h2>
            <div className={classes.settingsOptions}>
              <div className={classes.settingGroup}>
                <button
                  className={classes.settingItem}
                  onClick={toggleMusic}
                >
                  <div className={classes.settingIcon}>
                    {isMusicMuted ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    )}
                  </div>
                  <span>{isMusicMuted ? "Music: OFF" : "Music: ON"}</span>
                </button>
                <div className={classes.volumeSliderContainer}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.6">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className={classes.volumeSlider}
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.6">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                </div>
              </div>

              <div className={classes.settingGroup}>
                <button
                  className={classes.settingItem}
                  onClick={toggleSfx}
                >
                  <div className={classes.settingIcon}>
                    {isSfxMuted ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    )}
                  </div>
                  <span>{isSfxMuted ? "SFX: OFF" : "SFX: ON"}</span>
                </button>
                <div className={classes.volumeSliderContainer}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.6">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                    className={classes.volumeSlider}
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.6">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                </div>
              </div>

              <button
                className={`${classes.settingItem} ${classes.quitItem}`}
                onClick={() => setShowQuitConfirm(true)}
              >
                <div className={classes.settingIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                </div>
                <span>Quit Game</span>
              </button>
            </div>
            <button className={classes.closeSettings} onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}

      {/* TOP PLAYER ROW: Slots 1 (TL) and 2 (TR) */}
      <div className={classes.diceRow}>
        {renderPlayerTab(rotatedSlots[1], 'left')}
        {renderPlayerTab(rotatedSlots[2], 'right')}
      </div>

      <div className={`${classes.board} ${isBoardShaking ? classes.boardShake : ''}`}>
        {/* Chat Bubbles Overlay (In corners of board) */}
        {renderBoardBubbles(0)} {/* Bottom Left */}
        {renderBoardBubbles(1)} {/* Top Left */}
        {renderBoardBubbles(2)} {/* Top Right */}
        {renderBoardBubbles(3)} {/* Bottom Right */}

        <div style={{
          width: '100%',
          height: '100%',
          transform: `rotate(${boardRotation}deg)`,
          transformOrigin: '50% 50%',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <svg viewBox="0 0 15 15" width="100%" height="100%">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.2" result="blur" />
                <feComponentTransfer in="blur">
                  <feFuncA type="linear" slope="2" />
                </feComponentTransfer>
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* 3D Pawn Gradients */}
              <radialGradient id="gradRed" cx="35%" cy="35%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor="#ff7b6e" />
                <stop offset="100%" stopColor="#b71c1c" />
              </radialGradient>
              <radialGradient id="gradGreen" cx="35%" cy="35%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor="#81c784" />
                <stop offset="100%" stopColor="#1b5e20" />
              </radialGradient>
              <radialGradient id="gradBlue" cx="35%" cy="35%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor="#64b5f6" />
                <stop offset="100%" stopColor="#0d47a1" />
              </radialGradient>
              <radialGradient id="gradYellow" cx="35%" cy="35%" r="50%" fx="35%" fy="35%">
                <stop offset="0%" stopColor="#fff176" />
                <stop offset="100%" stopColor="#f57f17" />
              </radialGradient>
              
              <filter id="pawnShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.05" result="blur" />
              </filter>
            </defs>

            {/* GRID */}
            {[...Array(15)].map((_, y) =>
              [...Array(15)].map((_, x) => (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="1"
                  height="1"
                  fill="#fff"
                  stroke="#999"
                  strokeWidth="0.03"
                />
              ))
            )}

            {/* HOME BASES */}
            <rect x="0" y="0" width="6" height="6" fill="#f44336" />
            <rect x="9" y="0" width="6" height="6" fill="#4caf50" />
            <rect x="0" y="9" width="6" height="6" fill="#2196f3" />
            <rect x="9" y="9" width="6" height="6" fill="#fad416" />


            {/* HOME INNER BOXES */}
            <rect x="1" y="1" width="4" height="4" fill="#fff" />
            <rect x="10" y="1" width="4" height="4" fill="#fff" />
            <rect x="1" y="10" width="4" height="4" fill="#fff" />
            <rect x="10" y="10" width="4" height="4" fill="#fff" />

            {/* EXIT ICONS FOR QUIT PLAYERS */}
            {playerStatuses["#f44336"] === 'quit' && <ExitIcon x={3} y={3} color="#f44336" boardRotation={boardRotation} />}
            {playerStatuses["#4caf50"] === 'quit' && <ExitIcon x={12} y={3} color="#4caf50" boardRotation={boardRotation} />}
            {playerStatuses["#2196f3"] === 'quit' && <ExitIcon x={3} y={12} color="#2196f3" boardRotation={boardRotation} />}
            {playerStatuses["#fad416"] === 'quit' && <ExitIcon x={12} y={12} color="#fad416" boardRotation={boardRotation} />}

            {/* (Board Overlays Removed to fix "Other Board" jump) */}

            {/* ACTIVE INNER BORDER GLOW */}

            {/* WINNER LABELS (FIXED COORDINATES BASED ON COLOR) */}
            {Object.keys(playerNames).map((color) => {
              const finishedCount = pawns.filter(p => normalizeColor(p.color) === normalizeColor(color) && p.isFinished).length;
              const isMarkedWinner = (finishedCount === 4) || (winner && playerNames[color] === winner);

              if (isMarkedWinner) {
                const BASE_POSITIONS = {
                  "#f44336": { x: 3, y: 3 },   // Red (Top Left)
                  "#4caf50": { x: 12, y: 3 },  // Green (Top Right)
                  "#2196f3": { x: 3, y: 12 },  // Blue (Bottom Left)
                  "#fad416": { x: 12, y: 12 }  // Yellow (Bottom Right)
                };
                const pos = BASE_POSITIONS[color];
                if (!pos) return null;

                return (
                  <g key={`status-${color}`}>
                    <CrownIcon x={pos.x} y={pos.y} boardRotation={boardRotation} />
                    <rect x={pos.x - 1.5} y={pos.y + 0.6} width="3" height="0.6" rx="0.1" fill="rgba(0,0,0,0.6)" />
                    <text x={pos.x} y={pos.y + 1.0} fill="#ffd700" fontSize="0.35" textAnchor="middle" fontWeight="bold" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}>
                      WINNER!
                    </text>
                  </g>
                );
              }
              return null;
            })}



            {/* HOME PATHS (CORRECT ORIENTATION) */}

/* RED → from LEFT */
            {[1, 2, 3, 4, 5].map(x => (
              <rect key={`r-${x}`} x={x} y="7" width="1" height="1" fill="#f44336" />
            ))}

/* GREEN → from TOP */
            {[1, 2, 3, 4, 5].map(y => (
              <rect key={`g-${y}`} x="7" y={y} width="1" height="1" fill="#4caf50" />
            ))}

/* YELLOW → from RIGHT */
            {[9, 10, 11, 12, 13].map(x => (
              <rect key={`y-${x}`} x={x} y="7" width="1" height="1" fill="#fad416" />
            ))}

/* BLUE → from BOTTOM */
            {[9, 10, 11, 12, 13].map(y => (
              <rect key={`b-${y}`} x="7" y={y} width="1" height="1" fill="#2196f3" />
            ))}






            <rect x="1" y="6" width="1" height="1" fill="#f44336" />
            <rect x="8" y="1" width="1" height="1" fill="#4caf50" />
            <rect x="13" y="8" width="1" height="1" fill="#fad416" />
            <rect x="6" y="13" width="1" height="1" fill="#2196f3" />



            {/* SAFE RADIUS CIRCLES */}
            {SAFE_TILES.map((tile, i) => (
              <circle key={`safe-${i}`} cx={tile.x + 0.5} cy={tile.y + 0.5} r="0.45" fill="rgba(0,0,0,0.05)" />
            ))}

            {/* STAR MARKERS ON SAFE TILES */}
            {SAFE_TILES.map((tile, i) => (
              <Star key={`star-${i}`} cx={tile.x + 0.5} cy={tile.y + 0.5} />
            ))}

            {/* ENTRY ARROWS (RE-POSITIONED TO HOME LANE ENTRANCE AS PER DRAWING) */}
            {/* RED (Points into Red Home Lane) */}
            <path d="M 0.1 7.5 L 0.5 7.5 M 0.3 7.3 L 0.5 7.5 L 0.3 7.7" stroke="#f44336" strokeWidth="0.16" fill="none" strokeLinecap="round" />
            {/* GREEN (Points into Green Home Lane) */}
            <path d="M 7.5 0.1 L 7.5 0.5 M 7.3 0.3 L 7.5 0.5 L 7.7 0.3" stroke="#4caf50" strokeWidth="0.16" fill="none" strokeLinecap="round" />
            {/* YELLOW (Points into Yellow Home Lane) */}
            <path d="M 14.9 7.5 L 14.5 7.5 M 14.7 7.3 L 14.5 7.5 L 14.7 7.7" stroke="#fad416" strokeWidth="0.16" fill="none" strokeLinecap="round" />
            {/* BLUE (Points into Blue Home Lane) */}
            <path d="M 7.5 14.9 L 7.5 14.5 M 7.3 14.7 L 7.5 14.5 L 7.7 14.7" stroke="#2196f3" strokeWidth="0.16" fill="none" strokeLinecap="round" />

            {/* PLAYER NAMES IN BASES (Aligned with Reference) */}
            {/* RED (Left Side) */}
            {playerNames["#f44336"] && playerStatuses["#f44336"] !== 'quit' && (
              <g transform={`rotate(${-boardRotation}, 3, 3)`}>
                <rect x="0.2" y="1.5" width="0.8" height="3" rx="0.2" fill="none" stroke="none" strokeWidth="0.03" />
                <text x="0.6" y="3" fill="#fff" fontSize="0.4" textAnchor="middle" fontWeight="700"
                  transform="rotate(-90, 0.6, 3)" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {playerNames["#f44336"] || ""}
                </text>
              </g>
            )}

            {/* GREEN (Top Side) */}
            {playerNames["#4caf50"] && playerStatuses["#4caf50"] !== 'quit' && (
              <g transform={`rotate(${-boardRotation}, 12, 3)`}>
                <rect x="10.5" y="0.2" width="3" height="0.8" rx="0.2" fill="none" stroke="none" strokeWidth="0.03" />
                <text x="12" y="0.75" fill="#fff" fontSize="0.4" textAnchor="middle" fontWeight="700"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {playerNames["#4caf50"] || ""}
                </text>
              </g>
            )}

            {/* BLUE (Bottom Side) */}
            {playerNames["#2196f3"] && playerStatuses["#2196f3"] !== 'quit' && (
              <g transform={`rotate(${-boardRotation}, 3, 12)`}>
                <rect x="1.5" y="14" width="3" height="0.8" rx="0.2" fill="none" stroke="none" strokeWidth="0.03" />
                <text x="3" y="14.55" fill="#fff" fontSize="0.4" textAnchor="middle" fontWeight="700"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {playerNames["#2196f3"] || ""}
                </text>
              </g>
            )}

            {/* YELLOW (Right Side) */}
            {playerNames["#fad416"] && playerStatuses["#fad416"] !== 'quit' && (
              <g transform={`rotate(${-boardRotation}, 12, 12)`}>
                <rect x="14.1" y="10.5" width="0.8" height="3" rx="0.2" fill="none" stroke="none" strokeWidth="0.03" />
                <text x="14.5" y="12" fill="#fff" fontSize="0.4" textAnchor="middle" fontWeight="700"
                  transform="rotate(90, 14.5, 12)" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {playerNames["#fad416"] || ""}
                </text>
              </g>
            )}

            <circle cx="7.5" cy="7.5" r="0.8" fill="#fff" stroke="#333" strokeWidth="0.05" />

            {/* CENTER TRIANGLES */}
            <polygon points="6,6 6,9 7.5,7.5" fill="#f44336" stroke="#fff" strokeWidth="0.02" />
            <polygon points="6,6 9,6 7.5,7.5" fill="#4caf50" stroke="#fff" strokeWidth="0.02" />
            <polygon points="9,6 9,9 7.5,7.5" fill="#fad416" stroke="#fff" strokeWidth="0.02" />
            <polygon points="6,9 9,9 7.5,7.5" fill="#2196f3" stroke="#fff" strokeWidth="0.02" />

            {/* HOME PAWNS */}
            <HomePawns
              baseX={1.5} baseY={1.5}
              color="#f44336"
              onPawnClick={handlePawnClick}
              pawns={pawns.filter(p => normalizeColor(p.color) === "#f44336")}
              isActive={normalizeColor(currentTurn) === "#f44336" && dice === 6 && !isAnimating && !isWaitingForSync.current && (isLocalGame || isComputerGame || normalizeColor(myColor) === "#f44336")}
            />

            {/* PAWNS ON MAIN PATH & HOME LANE & FINISHED */}
            {pawns
              .filter(p => {
                const normColor = normalizeColor(p.color);
                return (p.pathIndex !== -1 || p.homeIndex !== -1) &&
                  playerNames[normColor] &&
                  playerStatuses[normColor] !== 'quit';
              })
              .sort((a, b) => {
                // Current player's pawns should be on top (rendered last)
                if (normalizeColor(a.color) === normalizeColor(currentTurn) && normalizeColor(b.color) !== normalizeColor(currentTurn)) return 1;
                if (normalizeColor(b.color) === normalizeColor(currentTurn) && normalizeColor(a.color) !== normalizeColor(currentTurn)) return -1;
                return 0;
              })
              .map(pawn => {
                const normPawnColor = normalizeColor(pawn.color);
                const isWinnerPawn = winnerColor && normPawnColor === normalizeColor(winnerColor);

                // If this is a winner's pawn, force it to be finished
                const displayPawn = isWinnerPawn ? { ...pawn, isFinished: true, homeIndex: 5, pathIndex: -1 } : pawn;

                let coord;
                if (displayPawn.pathIndex !== -1 && displayPawn.pathIndex >= 0 && displayPawn.pathIndex < MAIN_PATH.length) {
                  coord = MAIN_PATH[displayPawn.pathIndex];
                } else if (displayPawn.homeIndex !== -1) {
                  const normColor = normalizeColor(displayPawn.color);
                  const start = HOME_TURN_START[normColor];
                  const dir = LANE_DIRECTION[normColor];
                  coord = {
                    x: start.x + dir.dx * (displayPawn.homeIndex + 1),
                    y: start.y + dir.dy * (displayPawn.homeIndex + 1)
                  };
                }

                if (!coord) return null;

                let sameTile;
                let stackIndex;

                if (pawn.isFinished) {
                  // Stacking for finished pawns is based on color group
                  sameTile = pawns.filter(p => p.isFinished && normalizeColor(p.color) === normalizeColor(pawn.color));
                  stackIndex = sameTile.findIndex(p => p.id === pawn.id);
                } else {
                  // Normal tile-based stacking (Count ALL pawns on this tile regardless of color)
                  sameTile = pawns.filter(p => {
                    if (p.isFinished) return false;
                    if (p.pathIndex !== -1 && p.pathIndex >= 0 && p.pathIndex < MAIN_PATH.length) {
                      const c = MAIN_PATH[p.pathIndex];
                      return c.x === coord.x && c.y === coord.y;
                    }
                    if (p.homeIndex !== -1) {
                      const otherNorm = normalizeColor(p.color);
                      const dir = LANE_DIRECTION[otherNorm];
                      const startPos = HOME_TURN_START[otherNorm];
                      if (!startPos || !dir) return false;
                      const c = {
                        x: startPos.x + dir.dx * (p.homeIndex + 1),
                        y: startPos.y + dir.dy * (p.homeIndex + 1)
                      };
                      return c.x === coord.x && c.y === coord.y;
                    }
                    return false;
                  });
                  stackIndex = sameTile.findIndex(p => p.id === pawn.id);
                }

                return (
                  <MovingPawn
                    key={displayPawn.id}
                    pawn={displayPawn}
                    stackIndex={stackIndex}
                    stackCount={sameTile.length}
                    isActive={
                      normalizeColor(displayPawn.color) === normalizeColor(currentTurn) &&
                      !isAnimating &&
                      !isWaitingForSync.current &&
                      dice !== null &&
                      (isLocalGame || isComputerGame || normalizeColor(displayPawn.color) === normalizeColor(myColor)) &&
                      isPawnMovable(displayPawn, dice)
                    }
                    onMove={handlePawnClick}
                  />
                );
              })}



            {/* GREEN HOME */}
            <HomePawns
              baseX={10.5} baseY={1.5}
              color="#4caf50"
              onPawnClick={handlePawnClick}
              pawns={pawns.filter(p => normalizeColor(p.color) === "#4caf50")}
              isActive={normalizeColor(currentTurn) === "#4caf50" && dice === 6 && !isAnimating && !isWaitingForSync.current && (isLocalGame || isComputerGame || normalizeColor(myColor) === "#4caf50")}
            />

            {/* BLUE HOME */}
            <HomePawns
              baseX={1.5} baseY={10.5}
              color="#2196f3"
              onPawnClick={handlePawnClick}
              pawns={pawns.filter(p => normalizeColor(p.color) === "#2196f3")}
              isActive={normalizeColor(currentTurn) === "#2196f3" && dice === 6 && !isAnimating && !isWaitingForSync.current && (isLocalGame || isComputerGame || normalizeColor(myColor) === "#2196f3")}
            />

            {/* YELLOW HOME */}
            <HomePawns
              baseX={10.5} baseY={10.5}
              color="#fad416"
              onPawnClick={handlePawnClick}
              pawns={pawns.filter(p => normalizeColor(p.color) === "#fad416")}
              isActive={normalizeColor(currentTurn) === "#fad416" && dice === 6 && !isAnimating && !isWaitingForSync.current && (isLocalGame || isComputerGame || normalizeColor(myColor) === "#fad416")}
            />


            {/* BASE OVERLAYS (HIGHLIGHTING ONLY THE OUTER BORDER FRAME) */}
            <path d="M 0,0 H 6 V 6 H 0 Z M 1,1 H 5 V 5 H 1 Z" fill="black" fillRule="evenodd" className={`${classes.activeBaseOverlay} ${normalizeColor(currentTurn) === "#f44336" ? classes.activeBasePulse : ""}`} />
            <path d="M 9,0 H 15 V 6 H 9 Z M 10,1 H 14 V 5 H 10 Z" fill="black" fillRule="evenodd" className={`${classes.activeBaseOverlay} ${normalizeColor(currentTurn) === "#4caf50" ? classes.activeBasePulse : ""}`} />
            <path d="M 0,9 H 6 V 15 H 0 Z M 1,10 H 5 V 14 H 1 Z" fill="black" fillRule="evenodd" className={`${classes.activeBaseOverlay} ${normalizeColor(currentTurn) === "#2196f3" ? classes.activeBasePulse : ""}`} />
            <path d="M 9,9 H 15 V 15 H 9 Z M 10,10 H 14 V 14 H 10 Z" fill="black" fillRule="evenodd" className={`${classes.activeBaseOverlay} ${normalizeColor(currentTurn) === "#fad416" ? classes.activeBasePulse : ""}`} />

            {/* CENTER BORDER */}
            <rect
              x="6"
              y="6"
              width="3"
              height="3"
              fill="none"
              stroke="#000"
              strokeWidth="0.1"
            />
          </svg>
        </div>
      </div>


      {/* BOTTOM PLAYER ROW: Slots 0 (BL - Local Player) and 3 (BR) */}
      <div className={classes.diceRow}>
        {renderPlayerTab(rotatedSlots[0], 'left')}
        {renderPlayerTab(rotatedSlots[3], 'right')}
      </div>

      {/* 🔔 NOTIFICATION TOAST */}
      {notification && (
        <div className={`${classes.toast} ${classes[`toast_${notification.type}`]}`}>
          <span className={classes.toastMessage}>{notification.message}</span>
        </div>
      )}

      {/* 🚪 QUIT CONFIRMATION MODAL */}
      {showQuitConfirm && (
        <div className={classes.modalOverlay}>
          <div className={classes.confirmModal}>
            <div className={classes.confirmTitle}>Quit Game?</div>
            <div className={classes.confirmMessage}>
              Are you sure you want to leave? Your pawns will be removed and you won't be able to rejoin this match.
            </div>
            <div className={classes.confirmActions}>
              <button
                className={`${classes.confirmBtn} ${classes.confirmBtnNo}`}
                onClick={() => setShowQuitConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={`${classes.confirmBtn} ${classes.confirmBtnYes}`}
                onClick={() => {
                  if (myColor) quitGame(myColor);
                  navigate('/menu');
                }}
              >
                Yes, Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💬 CHAT SYSTEM */}
      <Chat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendSticker={handleSendSticker}
        localPlayerName={playerName || localStorage.getItem('ludo_player_name') || 'Player'}
        localPlayerColor={myColor}
        isWorldwide={location.state?.isWorldwide}
      />

      {/* ðŸ† CINEMATIC VICTORY OVERLAY */}
      {showWinOverlay && (
        <div className={classes.winOverlay}>
          <div className={classes.shineGlow}></div>

          <div className={classes.crownContainer}>
            <div className={classes.rankNumber}>1</div>
            <span className={classes.crownEmoji}>👑</span>
          </div>

          <div className={classes.winBanner}>
            <span className={classes.starEmoji}>â­</span>
            <div className={classes.winText}>You Winner</div>
            <span className={classes.starEmoji}>â­</span>
          </div>
        </div>
      )}

      {/* ðŸ† Result Overlay Removed in favor of Navigation */}
    </div >
  );
};

export default Board;