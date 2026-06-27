const { Server } = require("socket.io");
const gameService = require("./routes/Game/game.service");

let io = null;

// Track players in each game room
const gameRooms = new Map();
// Track lobby data (players, maxPlayers, hostId)
const lobbies = new Map();

// Matchmaking queues for Worldwide play (separate for 2p, 3p, 4p)
const matchmakingQueues = {
    2: [],
    3: [],
    4: []
};

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🔌 Socket connected:", socket.id);

        // Lobby Events
        socket.on("join_lobby", async ({ gameId, playerName, maxPlayers, isHost, userId }) => {
            const roomName = `lobby_${gameId}`;
            socket.join(roomName);

            try {
                const gameRows = await gameService.getLobbyData(gameId);
                if (gameRows.length === 0) return socket.emit("lobby_error", { error: "Game not found" });

                const dbGame = gameRows[0];
                const dbPlayers = await gameService.getLobbyPlayers(gameId);

                if (!lobbies.has(gameId)) {
                    const hostInDb = dbPlayers.find(p => p.color === "#f44336") || dbPlayers[0];
                    lobbies.set(gameId, {
                        players: [],
                        maxPlayers: dbGame.max_players || maxPlayers || 4,
                        hostId: null,
                        hostName: hostInDb?.name || playerName,
                        status: dbGame.status === 'playing' ? 'started' : 'waiting'
                    });
                }
                const lobby = lobbies.get(gameId);

                let playerColor;
                const isHostPlayer = isHost || playerName === lobby.hostName;

                const existingPlayer = lobby.players.find(p =>
                    (userId && p.userId === userId) || p.name === playerName
                );

                if (existingPlayer) {
                    playerColor = existingPlayer.color;
                } else if (isHostPlayer) {
                    playerColor = "#f44336"; 
                    lobby.hostId = socket.id;
                    lobby.hostName = playerName;
                } else {
                    const colors = parseInt(lobby.maxPlayers) === 2
                        ? ["#fad416"] 
                        : ["#4caf50", "#fad416", "#2196f3"]; 
                    const takenColors = lobby.players.map(p => p.color);
                    playerColor = colors.find(c => !takenColors.includes(c));
                }

                if (!playerColor) return socket.emit("lobby_error", { error: "Lobby full" });

                const playerObj = {
                    id: socket.id,
                    name: playerName,
                    color: playerColor,
                    isHost: isHostPlayer,
                    userId: userId || null
                };

                if (existingPlayer) {
                    const idx = lobby.players.findIndex(p => p.name === playerName);
                    lobby.players[idx] = playerObj;
                } else {
                    lobby.players.push(playerObj);
                }

                if (isHostPlayer) {
                    lobby.hostId = socket.id;
                }

                io.to(roomName).emit("lobby_update", {
                    players: lobby.players,
                    maxPlayers: lobby.maxPlayers,
                    hostId: lobby.hostId,
                    gameStatus: lobby.status
                });

            } catch (err) {
                console.error("Lobby error:", err);
            }
        });

        socket.on("get_lobby_data", ({ gameId }) => {
            const lobby = lobbies.get(gameId);
            if (lobby) {
                socket.emit("lobby_update", {
                    players: lobby.players,
                    maxPlayers: lobby.maxPlayers,
                    hostId: lobby.hostId,
                    gameStatus: lobby.status,
                    isHost: lobby.hostId === socket.id
                });
            }
        });

        socket.on("start_game", async ({ gameId }) => {
            const lobby = lobbies.get(gameId);
            if (!lobby) return;

            if (lobby.hostId !== socket.id) {
                return socket.emit("lobby_error", { error: "Only host can start the game" });
            }

            if (lobby.players.length < 2) {
                return socket.emit("lobby_error", { error: "Need at least 2 players to start" });
            }

            lobby.status = 'started';

            try {
                await gameService.startGame(gameId, lobby.players);
                io.to(`lobby_${gameId}`).emit("game_started", { gameId });
            } catch (err) {
                console.error("Error starting game:", err);
                socket.emit("lobby_error", { error: "Failed to start game" });
            }
        });

        socket.on("join_game", async (data) => {
            const gameId = typeof data === 'object' ? data.gameId : data;
            const color = typeof data === 'object' ? data.color : null;

            const roomName = `game_${gameId}`;
            socket.join(roomName);

            if (!gameRooms.has(roomName)) {
                gameRooms.set(roomName, new Set());
            }
            gameRooms.get(roomName).add(socket.id);
            socket.gameId = gameId;
            if (color) socket.playerColor = color;
            console.log(`👤 Socket ${socket.id} joined game ${gameId} [${color || 'no color'}]`);

            try {
                const messages = await gameService.getChatHistory(gameId);
                socket.emit("chat_history", messages);
            } catch (err) {
                console.error("Failed to fetch chat history:", err);
            }
        });

        socket.on("request_roll_dice", async (data) => {
            let gameId = data?.gameId || socket.gameId;
            if (!gameId) return;
            try {
                await gameService.processDiceRoll(gameId, io, data);
            } catch (err) {
                console.error("Socket dice roll error:", err);
                socket.emit("dice_roll_error", { error: err.message });
            }
        });

        socket.on("request_move_pawn", async (data) => {
            const gameId = data?.gameId || socket.gameId;
            const pawnId = data?.pawnId;
            if (!gameId || !pawnId) return;
            try {
                await gameService.processPawnMove(gameId, pawnId, io);
            } catch (err) {
                console.error("Socket pawn move error:", err);
                socket.emit("pawn_move_error", { error: err.message });
            }
        });

        socket.on("quit_game", async (data) => {
            const gameId = data?.gameId || socket.gameId;
            const color = data?.color;
            if (!gameId || !color) return;
            try {
                await gameService.processQuitGame(gameId, color, io);
            } catch (err) {
                console.error("Socket quit game error:", err);
            }
        });

        socket.on("send_message", async (data) => {
            const gameId = data?.gameId || socket.gameId;
            const roomName = `game_${gameId}`;
            if (gameId) {
                try {
                    await gameService.saveChatMessage(gameId, data.player, data.color, data.text);
                } catch (err) {
                    console.error("Failed to save chat message:", err);
                }

                io.to(roomName).emit("receive_message", {
                    text: data.text,
                    player: data.player,
                    color: data.color,
                    timestamp: new Date().toISOString()
                });
            }
        });

        socket.on("send_gift", (data) => {
            const gameId = data?.gameId || socket.gameId;
            if (gameId) {
                io.to(`game_${gameId}`).emit("receive_gift", {
                    fromColor: data.fromColor,
                    toColor: data.toColor,
                    giftId: data.giftId,
                    giftType: data.giftType || 'sticker'
                });
            }
        });

        socket.on("send_sticker", (data) => {
            const gameId = data?.gameId || socket.gameId;
            if (gameId) {
                io.to(`game_${gameId}`).emit("receive_sticker", {
                    color: data.color,
                    sticker: data.sticker
                });
            }
        });

        socket.on("update_lives", async (data) => {
            const gameId = data?.gameId || socket.gameId;
            const { color, lives } = data;
            if (gameId && color !== undefined) {
                try {
                    await gameService.updatePlayerLives(gameId, color, lives);
                } catch (err) {
                    console.error("Failed to persist lives:", err.message);
                }

                io.to(`game_${gameId}`).emit("receive_life_update", {
                    color: color,
                    lives: lives
                });
            }
        });

        // Matchmaking Events (Worldwide Play)
        socket.on("find_match", async ({ playerName, userId, playerCount, avatar }) => {
            const preferredSize = parseInt(playerCount) || 2;
            if (!matchmakingQueues[preferredSize]) return;

            // Remove from all queues first
            Object.values(matchmakingQueues).forEach(q => {
                const idx = q.findIndex(p => p.socketId === socket.id);
                if (idx !== -1) q.splice(idx, 1);
            });

            matchmakingQueues[preferredSize].push({
                socketId: socket.id,
                playerName,
                avatar: avatar || null,
                userId: userId || null,
                joinedAt: Date.now()
            });

            const currentQueue = matchmakingQueues[preferredSize];
            broadcastQueueUpdate(preferredSize);

            socket.emit("matchmaking_status", {
                status: "searching",
                queueLength: currentQueue.length,
                size: preferredSize,
                players: currentQueue.map(p => ({ id: p.socketId, playerName: p.playerName, avatar: p.avatar }))
            });

            // Try to match if pool is full
            if (currentQueue.length >= preferredSize) {
                const players = currentQueue.splice(0, preferredSize);
                
                try {
                    const allColors = ["#f44336", "#4caf50", "#fad416", "#2196f3"];
                    let colors = preferredSize === 2 ? ["#f44336", "#fad416"] : allColors.slice(0, preferredSize);

                    const gameId = await gameService.createWorldwideGame(preferredSize, players, colors);

                    const matchedPlayersDetails = players.map((p, i) => ({
                        name: p.playerName,
                        avatar: p.avatar,
                        color: colors[i]
                    }));

                    for (let i = 0; i < players.length; i++) {
                        io.to(players[i].socketId).emit("match_found", {
                            gameId,
                            color: colors[i],
                            playerName: players[i].playerName,
                            allPlayers: matchedPlayersDetails,
                            playerCount: preferredSize
                        });
                    }

                    const newTotal = Object.values(matchmakingQueues).reduce((acc, q) => acc + q.length, 0);
                    io.emit("queue_update", { totalSearchers: newTotal });

                } catch (err) {
                    console.error("Matchmaking creation error:", err);
                    players.forEach(p => {
                        io.to(p.socketId).emit("matchmaking_error", { error: "Failed to initialize game room" });
                    });
                }
            }
        });

        const broadcastQueueUpdate = (size) => {
            const currentQueue = matchmakingQueues[size] || [];
            const totalSearchers = Object.values(matchmakingQueues).reduce((acc, q) => acc + q.length, 0);
            io.emit("queue_update", {
                length: currentQueue.length,
                size: parseInt(size),
                totalSearchers,
                players: currentQueue.map(p => ({ id: p.socketId, playerName: p.playerName, avatar: p.avatar }))
            });
        };

        socket.on("cancel_match", () => {
            Object.keys(matchmakingQueues).forEach(size => {
                const q = matchmakingQueues[size];
                const idx = q.findIndex(p => p.socketId === socket.id);
                if (idx !== -1) {
                    q.splice(idx, 1);
                    broadcastQueueUpdate(size);
                }
            });
            socket.emit("matchmaking_status", { status: "idle" });
        });

        socket.on("disconnect", async () => {
            Object.keys(matchmakingQueues).forEach(size => {
                const q = matchmakingQueues[size];
                const idx = q.findIndex(p => p.socketId === socket.id);
                if (idx !== -1) {
                    q.splice(idx, 1);
                    broadcastQueueUpdate(size);
                }
            });

            const gameId = socket.gameId;
            if (gameId) {
                const lobby = lobbies.get(gameId);
                let colorToQuit = socket.playerColor;

                if (lobby) {
                    const quitter = lobby.players.find(p => p.id === socket.id);
                    if (quitter) {
                        if (!colorToQuit) colorToQuit = quitter.color;
                        lobby.players = lobby.players.filter(p => p.id !== socket.id);
                        if (lobby.players.length === 0) {
                            lobbies.delete(gameId);
                        } else if (lobby.hostId === socket.id) {
                            lobby.hostId = lobby.players[0].id;
                            lobby.players[0].isHost = true;
                        }

                        io.to(`lobby_${gameId}`).emit("lobby_update", {
                            players: lobby.players,
                            maxPlayers: lobby.maxPlayers,
                            hostId: lobby.hostId
                        });
                    }
                }

                const roomName = `game_${gameId}`;
                if (gameRooms.has(roomName)) {
                    gameRooms.get(roomName).delete(socket.id);
                    if (gameRooms.get(roomName).size === 0) {
                        gameRooms.delete(roomName);
                    }
                }
            }
        });
    });

    return io;
}

function getIO() {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
}

function broadcastGameState(gameId, gameState) {
    if (io) io.to(`game_${gameId}`).emit("game_state_updated", gameState);
}

function getPlayerCount(gameId) {
    const roomName = `game_${gameId}`;
    return gameRooms.has(roomName) ? gameRooms.get(roomName).size : 0;
}

module.exports = { initSocket, getIO, broadcastGameState, getPlayerCount };
