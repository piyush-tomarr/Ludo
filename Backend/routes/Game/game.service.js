const { pool } = require("../../db/connection");

const PLAYER_ORDER = ["#f44336", "#4caf50", "#fad416", "#2196f3"];

const normalizeColor = (color) => {
    if (!color) return color;
    const lower = color.trim().toLowerCase();
    if (lower === "#fad416") return "#fad416";
    return lower;
};

/**
 * 🕵️‍♂️ Helper to find the next player who hasn't finished all 4 pawns.
 */
const getNextActiveTurn = async (connection, gameId, startFromColor) => {
    const normalizedStart = normalizeColor(startFromColor);
    let currentIndex = PLAYER_ORDER.findIndex(c => c.toLowerCase() === normalizedStart.toLowerCase());

    // Get active colors (not quit AND has unfinished pawns)
    // We fetch all active players and their unfinished pawn counts separately to avoid JOIN color mismatch bugs
    const [players] = await connection.execute(
        process.env.GET_ACTIVE_PLAYER_COLORS,
        [gameId]
    );

    const [pawnCounts] = await connection.execute(
        process.env.GET_UNFINISHED_PAWN_COUNTS,
        [gameId]
    );

    const unfinishedCountMap = {};
    pawnCounts.forEach(r => {
        unfinishedCountMap[normalizeColor(r.color)] = r.count;
    });

    const activeColors = new Set();
    players.forEach(p => {
        const norm = normalizeColor(p.color);
        if (unfinishedCountMap[norm] > 0) {
            activeColors.add(norm);
        }
    });

    console.log(`🔍 [getNextActiveTurn] Finding next turn after ${normalizedStart} in game ${gameId}`);

    for (let i = 1; i <= PLAYER_ORDER.length; i++) {
        const nextIndex = (currentIndex + i) % PLAYER_ORDER.length;
        const nextColor = PLAYER_ORDER[nextIndex].toLowerCase();
        const normalizedNext = normalizeColor(nextColor);

        console.log(`   Checking player ${normalizedNext}... ${activeColors.has(normalizedNext) ? "ACTIVE" : "INACTIVE"}`);
        if (activeColors.has(normalizedNext)) {
            console.log(`   ✅ Selected next turn: ${nextColor}`);
            return nextColor;
        }

        if (i === PLAYER_ORDER.length) {
            console.warn(`   ⚠️ No active players found! Staying with ${startFromColor}`);
            return startFromColor;
        }
    }
    return startFromColor;
};

const processDiceRoll = async (gameId, io, req = {}) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        // 🧠 Get current game WITH ROW LOCKING
        const [gameRows] = await connection.execute(
            process.env.GET_GAME_FOR_UPDATE,
            [gameId]
        );

        if (!gameRows.length) {
            throw new Error(`Game not found with ID: ${gameId}`);
        }

        const game = gameRows[0];

        // 🛡️ VALIDATION: If a specific color was requested, it must match current state
        if (req && req.color && normalizeColor(req.color) !== normalizeColor(game.current_turn)) {
            throw new Error(`Invalid turn: Requested ${req.color} but current is ${game.current_turn}`);
        }
        // 🧠 Get all pawns and player info for this game (LOAD EARLY for guards)
        const [allPawns] = await connection.execute(
            process.env.GET_PAWNS_BY_GAME,
            [gameId]
        );

        const [playerRows] = await connection.execute(
            process.env.GET_PLAYERS_BY_GAME,
            [gameId]
        );

        const normalizedTurn = normalizeColor(game.current_turn);
        const playerPawns = allPawns.filter(p => normalizeColor(p.color) === normalizedTurn);
        const currentPlayer = playerRows.find(p => normalizeColor(p.color) === normalizedTurn);

        // 🛡️ RE-ROLL GUARD: If dice is already rolled for this turn, just return it instead of erroring
        if (game.dice_value !== null && game.dice_value > 0) {
            console.log(`📡 [processDiceRoll] Player ${game.current_turn} requested re-roll. Returning existing dice: ${game.dice_value}`);

            // Re-calculate hasMove for safety
            const hasMove = playerPawns.some((pawn) => {
                if (pawn.is_finished) return false;
                if (pawn.path_index !== -1) return true;
                if (pawn.home_index !== -1 && pawn.home_index < 5) {
                    return (pawn.home_index + (game.dice_value || 0) <= 5);
                }
                if (pawn.path_index === -1 && pawn.home_index === -1 && game.dice_value === 6) {
                    return true;
                }
                return false;
            });

            io.to(`game_${gameId}`).emit("dice_rolled", {
                dice: game.dice_value,
                current_turn: game.current_turn,
                hasMove
            });

            return {
                dice: game.dice_value,
                current_turn: game.current_turn,
                hasMove
            };
        }

        let nextTurn = game.current_turn;

        // 🎲 Generate dice
        let dice = Math.floor(Math.random() * 6) + 1;

        // 🛡️ ANTI-3-SIXES: Proactively prevent a 3rd consecutive 6 to avoid skipped turns
        const currentConsecutive = currentPlayer?.consecutive_sixes || 0;
        if (dice === 6 && currentConsecutive >= 2) {
            console.log(`🚫 [ANTI-3-SIXES] Player ${normalizedTurn} would have rolled a 3rd six. Forcing alternate roll (1-5).`);
            dice = Math.floor(Math.random() * 5) + 1; // 1-5 only
        }

        // 🎰 FORCED 6 LOGIC: If player couldn't move for 6 turns, force 6 on 7th
        if (currentPlayer) {
            const currentNoMoveCount = currentPlayer.no_six_count || 0;
            if (currentNoMoveCount >= 6) {
                console.log(`🎰 [FORCED 6] Player ${normalizedTurn} forced 6 (Attempt: ${currentNoMoveCount + 1})`);
                dice = 6;
            }
        }

        console.log(`🔍 [processDiceRoll] Game ${gameId}: ${normalizedTurn} rolled a ${dice} (Count: ${currentPlayer?.no_six_count || 0})`);
        console.log(`   Found ${playerPawns.length} pawns for player ${normalizedTurn}`);

        let consecutiveSixes = (currentPlayer?.consecutive_sixes || 0);
        let hasMove = false;

        if (dice === 6) {
            consecutiveSixes += 1;
        } else {
            consecutiveSixes = 0;
        }

        if (consecutiveSixes >= 3) {
            console.log(`🚫 [CONSECUTIVE SIXES] Player ${normalizedTurn} rolled 3 sixes! Skipping turn.`);
            hasMove = false;
            nextTurn = await getNextActiveTurn(connection, gameId, game.current_turn);
            consecutiveSixes = 0; // Reset for next time they get a turn
        } else {
            // 🧠 Check if player has valid move
            hasMove = playerPawns.some((pawn) => {
                if (pawn.is_finished) return false;
                if (pawn.path_index !== -1) return true;
                if (pawn.home_index !== -1 && pawn.home_index < 5) {
                    return (pawn.home_index + dice <= 5);
                }
                if (pawn.path_index === -1 && pawn.home_index === -1 && dice === 6) {
                    return true;
                }
                return false;
            });

            if (!hasMove) {
                nextTurn = await getNextActiveTurn(connection, gameId, game.current_turn);
                consecutiveSixes = 0; // Reset since turn is changing
                console.log(`   🚫 No moves possible. New turn will be: ${nextTurn}`);

                // Increment no-move counter
                if (currentPlayer) {
                    await connection.execute(
                        process.env.INCREMENT_NO_SIX_COUNT,
                        [currentPlayer.id]
                    );
                }
            } else {
                console.log(`   ✅ Player has moves. Turn staying: ${nextTurn}`);
            }
        }

        // Update player's consecutive count
        if (currentPlayer) {
            await connection.execute(
                process.env.UPDATE_CONSECUTIVE_SIXES,
                [consecutiveSixes, currentPlayer.id]
            );
        }

        // ✅ Update dice + possibly new turn
        // 🚨 CRITICAL: If no move is possible, we MUST clear dice_value in DB so the NEXT player can roll!
        const dbDiceValue = hasMove ? dice : null;
        await connection.execute(
            process.env.UPDATE_GAME_DICE_AND_TURN,
            [dbDiceValue, nextTurn, gameId]
        );

        await connection.commit();

        // Emit dice rolled event to game room
        console.log(`   📡 Emitting dice_rolled to room game_${gameId}`);
        io.to(`game_${gameId}`).emit("dice_rolled", {
            dice,
            current_turn: nextTurn,
            hasMove,
            isAuto: req.isAuto || false
        });

        return {
            dice,
            current_turn: nextTurn,
            hasMove
        };

    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 🏆 Helper to finalize the game and update user stats.
 */
const completeGame = async (connection, gameId) => {
    // 🧠 1. Mark game as finished ONLY IF it wasn't already finished
    // This prevents double-counting if multiple events trigger completion
    const [updateRes] = await connection.execute(
        process.env.UPDATE_GAME_STATUS_FINISHED,
        [gameId]
    );

    if (updateRes.affectedRows === 0) {
        console.log(`⚠️ [completeGame] Game ${gameId} already finalized or not found.`);
        return;
    }

    console.log(`🏆 [completeGame] Finalizing Game ${gameId}...`);

    // 2. Get ALL players to calculate ranking and update stats
    const [players] = await connection.execute(
        process.env.GET_GAME_PLAYERS_FOR_RANKING,
        [gameId]
    );

    console.log(`   👥 [completeGame] Found ${players.length} players for game ${gameId}`);
    players.forEach(p => console.log(`      - ${p.name} (${p.color}): status=${p.status}, finished_at=${p.finished_at}, user_id=${p.user_id}, is_stat_updated=${p.is_stat_updated}`));

    // 🥇 Calculate scores for tie-breaking
    const [allPawns] = await connection.execute(
        process.env.GET_PAWNS_FOR_SCORE,
        [gameId]
    );

    const scoresMap = {};
    allPawns.forEach(p => {
        const norm = normalizeColor(p.color);
        if (!scoresMap[norm]) scoresMap[norm] = 0;
        scoresMap[norm] += (p.steps_travelled || 0);
        if (p.is_finished) scoresMap[norm] += 100; // Bonus for cada pawn that finished
    });

    // 🥇 Sorting logic for Ranking:
    // 1. Finished players (by finished_at ASC)
    // 2. The winner (active > quit)
    // 3. Score (total steps)
    const sortedPlayers = [...players].sort((a, b) => {
        const normA = normalizeColor(a.color);
        const normB = normalizeColor(b.color);

        // 🥇 Priority 1: Finished players (by time)
        if (a.finished_at && b.finished_at) return new Date(a.finished_at) - new Date(b.finished_at);
        if (a.finished_at) return -1;
        if (b.finished_at) return 1;

        // 🥈 Priority 2: Status 'active' beats 'quit'
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;

        // 🥉 Priority 3: Score (total steps travelled)
        return (scoresMap[normB] || 0) - (scoresMap[normA] || 0);
    });

    // 4. Determine Rewards and Winner Identification
    const winnerPlayer = sortedPlayers[0];
    if (!winnerPlayer) {
        console.error("❌ [statUpdate] Could not identify winner. Skipping stat update.");
        return;
    }

    const winnerUserId = winnerPlayer.user_id;
    const winnerPid = winnerPlayer.id;

    console.log(`   🔎 [completeGame] Winner: ${winnerPlayer.name}, user_id: ${winnerUserId}, is_stat_updated: ${winnerPlayer.is_stat_updated}`);

    // Fetch prize amounts (180 for 2-player, 250 for 3/4-player)
    const [gameRows] = await connection.execute(process.env.GET_GAME_MAX_PLAYERS, [gameId]);
    const maxPlayers = gameRows[0]?.max_players || 2;
    const winAmount = maxPlayers === 2 ? 180 : 250;
    const runnerUpAmount = maxPlayers > 2 ? 100 : 0;

    console.log(`   🏁 [statUpdate] Winner determined: ${winnerPlayer.name} (User: ${winnerUserId}) for game ${gameId}`);

    // 5. Explicitly Update the Winner FIRST
    if (winnerUserId && winnerPlayer.is_stat_updated == 0) {
        try {
            console.log(`   🥇 [statUpdate] Crediting WIN to User ${winnerUserId} (Amount: ${winAmount})`);
            const [winRes] = await connection.execute(
                process.env.UPDATE_USER_WIN_STATS,
                [winAmount, winnerUserId]
            );
            console.log(`   ✅ [statUpdate] Winner updated in users table. Affected rows: ${winRes.affectedRows}`);

            const [plUpRes] = await connection.execute(process.env.MARK_PLAYER_STAT_UPDATED, [gameId, winnerPlayer.color]);
            console.log(`   ✅ [statUpdate] Winner marked updated in game_players. Affected rows: ${plUpRes.affectedRows}`);
        } catch (winErr) {
            console.error(`   ❌ [statUpdate] WINNER UPDATE FAILED:`, winErr);
        }
    } else {
        console.log(`   ⏭️ [statUpdate] Skipping Winner Update: winnerUserId=${winnerUserId}, is_stat_updated=${winnerPlayer.is_stat_updated}`);
    }

    // 6. Update Others (Losses / Runner-ups)
    for (const p of players) {
        // Skip winner (already done) and anybody already marked updated
        if (String(p.id) === String(winnerPid)) continue;
        if (p.is_stat_updated == 1 || !p.user_id) {
            console.log(`   ⏭️ [statUpdate] Skipping Player ${p.name}: is_stat_updated=${p.is_stat_updated}, user_id=${p.user_id}`);
            continue;
        }

        const pRank = sortedPlayers.findIndex(s => String(s.id) === String(p.id)) + 1;
        const uid = p.user_id;

        try {
            if (pRank === 2 && runnerUpAmount > 0) {
                console.log(`   🥈 [statUpdate] Crediting RUNNER-UP to User ${uid} (Amount: ${runnerUpAmount})`);
                const [upRes] = await connection.execute(
                    process.env.UPDATE_USER_RUNNER_UP_STATS,
                    [runnerUpAmount, uid]
                );
                console.log(`   ✅ [statUpdate] Runner-up updated in users table. Affected: ${upRes.affectedRows}`);
            } else {
                console.log(`   🥉 [statUpdate] Crediting LOSS to User ${uid}`);
                const [upRes] = await connection.execute(
                    process.env.UPDATE_USER_LOSS_STATS,
                    [uid]
                );
                console.log(`   ✅ [statUpdate] Loser updated in users table. Affected: ${upRes.affectedRows}`);
            }
            const [plUpRes] = await connection.execute(process.env.MARK_PLAYER_STAT_UPDATED, [gameId, p.color]);
            console.log(`   ✅ [statUpdate] Player marked updated in game_players. Affected: ${plUpRes.affectedRows}`);
        } catch (lossErr) {
            console.error(`   ❌ [statUpdate] LOSS UPDATE FAILED for ${p.name}:`, lossErr);
        }
    }

    // 🧹 5. Cleanup: Delete chat messages for this game
    try {
        console.log(`🧹 [completeGame] Cleaning up chat messages for game ${gameId}`);
        await connection.execute(
            process.env.DELETE_GAME_CHAT,
            [gameId]
        );
    } catch (err) {
        console.error("Failed to delete chat messages on game completion:", err);
    }
};

const processPawnMove = async (gameId, pawnId, io) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        /* ================= GET GAME WITH ROW LOCKING ================= */
        const [gameRows] = await connection.execute(
            `SELECT * FROM games WHERE id = ? FOR UPDATE`,
            [gameId]
        );

        if (!gameRows.length) throw new Error("Game not found");
        const game = gameRows[0];

        if (game.status === 'finished') throw new Error("Game is already finished");
        if (game.dice_value === null) throw new Error("Roll dice first");
        const dice = game.dice_value;

        const [playerRows] = await connection.execute(
            process.env.GET_PLAYERS_BY_GAME,
            [gameId]
        );

        /* ================= GET PAWN (FRESH DATA) ================= */
        const [pawnRows] = await connection.execute(
            process.env.GET_PAWN_BY_ID,
            [pawnId]
        );

        if (!pawnRows.length) throw new Error("Pawn not found");
        const pawn = pawnRows[0];

        // 🛡️ VALIDATION: Is it this player's turn?
        if (normalizeColor(pawn.color) !== normalizeColor(game.current_turn)) {
            throw new Error("Not your turn!");
        }
        const ENTRY_INDEX = {
            "#f44336": 41,
            "#4caf50": 2,
            "#fad416": 15,
            "#2196f3": 28,
        };

        /* ================= MOVEMENT LOGIC ================= */
        let newPathIndex = pawn.path_index;
        let newHomeIndex = pawn.home_index;
        let newSteps = pawn.steps_travelled;
        let isFinished = pawn.is_finished;
        let isEntry = false;
        let killed = false;
        let killedPawnId = null;
        let killedFromIndex = null;

        if (pawn.path_index === -1 && pawn.home_index === -1) {
            // Opening from base
            if (dice !== 6) throw new Error("Need 6 to enter");
            newPathIndex = ENTRY_INDEX[normalizeColor(pawn.color)];
            if (newPathIndex === undefined) throw new Error(`Invalid entry for color ${pawn.color}`);
            newSteps = 0;
            isEntry = true;
        } else if (pawn.home_index !== -1) {
            // Moving inside home lane
            if (pawn.home_index + dice <= 5) {
                newHomeIndex = pawn.home_index + dice;
                newSteps = pawn.steps_travelled + dice;
                if (newHomeIndex === 5) isFinished = 1;
            } else {
                throw new Error("Roll too high to move");
            }
        } else {
            // Normal path
            const totalSteps = pawn.steps_travelled + dice;
            if (totalSteps > 50) {
                const remaining = dice - (50 - pawn.steps_travelled);
                newPathIndex = -1;
                newHomeIndex = remaining - 1;
                newSteps = totalSteps;
                if (newHomeIndex === 5) isFinished = 1;
            } else {
                newPathIndex = (pawn.path_index + dice) % 52;
                newSteps = totalSteps;
            }
        }

        /* ================= CHECK KILL ================= */
        const SAFE_TILES = [2, 10, 15, 23, 28, 36, 41, 49];
        if (newPathIndex !== -1 && !SAFE_TILES.includes(newPathIndex)) {
            const [sameColor] = await connection.execute(
                process.env.COUNT_PAWNS_AT_POSITION,
                [gameId, pawn.color, newPathIndex]
            );
            if (sameColor[0].count < 2) {
                const [opponents] = await connection.execute(
                    process.env.GET_OPPONENT_PAWNS_AT_POSITION,
                    [gameId, pawn.color, newPathIndex]
                );
                if (opponents.length > 0) {
                    killed = true;
                    killedPawnId = opponents[0].id;
                    killedFromIndex = opponents[0].path_index;
                    await connection.execute(
                        process.env.RESET_PAWN,
                        [killedPawnId]
                    );
                }
            }
        }

        /* ================= UPDATE MOVED PAWN ================= */
        await connection.execute(
            process.env.UPDATE_PAWN_POSITION,
            [newPathIndex, newHomeIndex, newSteps, isFinished, pawnId]
        );

        // ✅ RESET PITY COUNTER on successful move
        await connection.execute(
            process.env.RESET_PLAYER_PITY,
            [gameId, game.current_turn]
        );

        /* ================= TURN LOGIC & WIN CHECK ================= */
        let nextTurn = game.current_turn;

        const [allGamePawns] = await connection.execute(
            process.env.GET_PAWNS_BY_GAME,
            [gameId]
        );
        const playerIsFinished = allGamePawns
            .filter(p => normalizeColor(p.color) === normalizeColor(game.current_turn))
            .every(p => p.is_finished === 1);

        let gameFinished = false;

        const [unfinishedCounts] = await connection.execute(
            `SELECT color, COUNT(*) as count FROM pawns WHERE game_id = ? AND is_finished = 0 GROUP BY color`,
            [gameId]
        );

        const unfinishedCountMap = {};
        unfinishedCounts.forEach(r => unfinishedCountMap[normalizeColor(r.color)] = r.count);

        const normalizedTurn = normalizeColor(game.current_turn);

        if (playerIsFinished) {
            console.log(`🎉 Player ${game.current_turn} finished all pawns!`);

            // 🕒 Mark the finishing time for ranking
            await connection.execute(
                process.env.UPDATE_PLAYER_FINISHED_TIME,
                [gameId, game.current_turn]
            );

            // 🏁 RE-CALCULATE players still playing (excluding the one who just finished)
            const remainingPlayers = playerRows.filter(p => {
                const norm = normalizeColor(p.color);
                const isCurrent = norm === normalizedTurn;
                const count = unfinishedCountMap[norm] || 0;
                // If it was the current player and they just finished their last pawn
                const adjustedCount = isCurrent ? count - 1 : count;
                return p.status === 'active' && adjustedCount > 0;
            });

            console.log(`🔍 [processPawnMove] Unfinished Count Map:`, unfinishedCountMap);
            console.log(`🔍 [processPawnMove] Players left playing/unfinished: ${remainingPlayers.length}`);
            remainingPlayers.forEach(p => console.log(`   - ${p.name} (${p.color}): status=${p.status}`));

            // Game is over if:
            // 1. Nobodys left playing (unlikely here)
            // 2. Only 1 player remains playing (Last man standing)
            if (remainingPlayers.length <= 1) {
                console.log(`🏳️ Finishing game officially. Remaining count: ${remainingPlayers.length}`);
                gameFinished = true;
                await completeGame(connection, gameId);
                // 🔄 Even if finished, rotate turn for state consistency (optional but helps avoid "stuck" UI)
                nextTurn = await getNextActiveTurn(connection, gameId, game.current_turn);
            } else {
                // Game continues for others!
                console.log(`🏃 Game continues for ${remainingPlayers.length} remaining active players.`);
                nextTurn = await getNextActiveTurn(connection, gameId, game.current_turn);
                console.log(`   ⏭️ Next turn: ${nextTurn}`);
            }
        } else {
            // 🧠 BONUS TURN LOGIC:
            // Gets another turn if: 6 rolled, killed opponent, OR finished one pawn (but still has others left)
            const getsBonus = (Number(dice) === 6 || killed || isFinished);
            if (!getsBonus) {
                nextTurn = await getNextActiveTurn(connection, gameId, game.current_turn);
            }
        }


        await connection.execute(
            process.env.UPDATE_GAME_TURN_ONLY,
            [nextTurn, gameId]
        );

        await connection.commit();

        /* ================= EMIT EVENTS ================= */
        io.to(`game_${gameId}`).emit("pawn_moved", {
            pawnId, dice, killed, killedPawnId, killedFromIndex,
            current_turn: nextTurn, isEntry, homeIndex: newHomeIndex, isFinished
        });

        if (gameFinished) {
            // 🥇 Fetch FINAL RANKING
            const [finalPlayers] = await connection.execute(
                process.env.GET_GAME_RESULTS_RANKED,
                [gameId]
            );

            const results = finalPlayers.map((p, index) => ({
                name: p.name,
                color: normalizeColor(p.color),
                position: p.finished_at ? 0 : 99, // Temporary sorting helper
                finishedAt: p.finished_at
            }));

            // Sort: Those who finished by time, then those who are still active/quit
            results.sort((a, b) => {
                if (a.finishedAt && b.finishedAt) return new Date(a.finishedAt) - new Date(b.finishedAt);
                if (a.finishedAt) return -1;
                if (b.finishedAt) return 1;
                return 0;
            });

            // Assign ranks 1, 2, 3, 4
            const rankedResults = results.map((r, i) => ({ ...r, rank: i + 1 }));

            const winnerPlayer = rankedResults[0];

            io.to(`game_${gameId}`).emit("game_over", {
                winner: winnerPlayer.name,
                winnerColor: winnerPlayer.color,
                rankings: rankedResults
            });
        }

        return { pawnId, current_turn: nextTurn, gameFinished };

    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) connection.release();
    }
};

const processQuitGame = async (gameId, color, io) => {
    console.log(`🚪 [processQuitGame] Triggered for game ${gameId}, color ${color}`);
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        // 1. Update player status to 'quit' AND application immediate loss penalty
        const [targetPlayerRows] = await connection.execute(`SELECT user_id, is_stat_updated FROM game_players WHERE game_id = ? AND color = ?`, [gameId, color]);
        const targetPlayer = targetPlayerRows[0];

        const [res] = await connection.execute(
            process.env.UPDATE_PLAYER_STATUS_QUIT,
            [gameId, color]
        );

        if (targetPlayer && targetPlayer.user_id && !targetPlayer.is_stat_updated) {
            console.log(`   📊 Applying IMMEDIATE loss penalty for ${color} (User: ${targetPlayer.user_id})`);
            await connection.execute(
                process.env.UPDATE_USER_LOSS_STATS,
                [targetPlayer.user_id]
            );
            await connection.execute(process.env.MARK_PLAYER_STAT_UPDATED, [gameId, color]);
        }

        console.log(`   ✅ Player status updated to quit. Rows affected: ${res.affectedRows}`);

        // 1b. Clear pawns of quitting player (optional but recommended for gameplay)
        await connection.execute(
            process.env.RESET_ALL_PLAYER_PAWNS,
            [gameId, color]
        );

        // 2. Get active players
        const [activePlayers] = await connection.execute(
            process.env.GET_ACTIVE_PLAYERS,
            [gameId]
        );

        const [gameRows] = await connection.execute(
            `SELECT * FROM games WHERE id = ? FOR UPDATE`,
            [gameId]
        );
        if (!gameRows.length) throw new Error("Game not found");
        const game = gameRows[0];
        let nextTurn = game.current_turn;

        // 3. Check if game is over
        // The game ends if the number of players STILL PLAYING (not finished, not quit) is 0 or 1
        const [unfinishedCounts] = await connection.execute(
            `SELECT color, COUNT(*) as count FROM pawns WHERE game_id = ? AND is_finished = 0 GROUP BY color`,
            [gameId]
        );
        const unfinishedMap = {};
        unfinishedCounts.forEach(r => unfinishedMap[normalizeColor(r.color)] = r.count);

        const playingNow = activePlayers.filter(p => (unfinishedMap[normalizeColor(p.color)] || 0) > 0);
        console.log(`   🔍 [processQuitGame] Players still moving: ${playingNow.length}`);

        if (playingNow.length <= 1) {
            console.log(`   🏁 Ending game because ${playingNow.length} players left moving.`);
            await completeGame(connection, gameId);

            // 🥇 Fetch FINAL RANKING for Quit Case
            const [finalPlayers] = await connection.execute(
                process.env.GET_GAME_PLAYERS_BASIC,
                [gameId]
            );

            const results = finalPlayers.map(p => ({
                name: p.name,
                color: normalizeColor(p.color),
                finishedAt: p.finished_at,
                status: p.status
            }));

            // 🥇 Calculate scores for tie-breaking
            const [allPawns] = await connection.execute(
                `SELECT color, steps_travelled, is_finished FROM pawns WHERE game_id = ?`,
                [gameId]
            );

            const scoresMap = {};
            allPawns.forEach(p => {
                const norm = normalizeColor(p.color);
                if (!scoresMap[norm]) scoresMap[norm] = 0;
                scoresMap[norm] += (p.steps_travelled || 0);
                if (p.is_finished) scoresMap[norm] += 100;
            });

            // Ranking Logic for Quits:
            // 1. Those who finished (by finishedAt)
            // 2. The winner (active > quit)
            // 3. Score (total steps)
            results.sort((a, b) => {
                const normA = normalizeColor(a.color);
                const normB = normalizeColor(b.color);

                if (a.finishedAt && b.finishedAt) return new Date(a.finishedAt) - new Date(b.finishedAt);
                if (a.finishedAt) return -1;
                if (b.finishedAt) return 1;

                const aActive = a.status === 'active';
                const bActive = b.status === 'active';
                if (aActive && !bActive) return -1;
                if (bActive && !aActive) return 1;

                return (scoresMap[normB] || 0) - (scoresMap[normA] || 0);
            });

            const rankedResults = results.map((r, i) => ({ ...r, rank: i + 1 }));

            // 📣 Emit game_over event
            io.to(`game_${gameId}`).emit("game_over", {
                winner: rankedResults[0]?.name || "None",
                winnerColor: rankedResults[0]?.color || null,
                rankings: rankedResults,
                reason: activePlayers.length === 0 ? "all_quit" : "last_man_standing"
            });
        } else {
            // 4. If quitting player was the current turn, rotate turn
            if (normalizeColor(game.current_turn) === normalizeColor(color)) {
                nextTurn = await getNextActiveTurn(connection, gameId, color);
                await connection.execute(
                    process.env.UPDATE_GAME_TURN_ONLY,
                    [nextTurn, gameId]
                );
            }
        }

        await connection.commit();
        console.log(`   ✅ Transaction committed for game ${gameId}`);

        // 5. Broadcast updated state
        const [pawns] = await connection.execute(process.env.GET_PAWNS_BY_GAME, [gameId]);
        const [games] = await connection.execute(process.env.GET_GAME_BY_ID, [gameId]);
        const [players] = await connection.execute(process.env.GET_PLAYERS_BY_GAME, [gameId]);

        const quittingPlayer = players.find(p => normalizeColor(p.color) === normalizeColor(color));
        io.to(`game_${gameId}`).emit("player_quit", {
            name: quittingPlayer?.name || "A player",
            color: normalizeColor(color)
        });

        io.to(`game_${gameId}`).emit("game_state_updated", {
            game: games[0],
            pawns,
            players
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Error in processQuitGame:", err);
    } finally {
        if (connection) connection.release();
    }
};

const initializeGame = async (players, maxPlayers) => {
    const colors = ["#f44336", "#4caf50", "#fad416", "#2196f3"];
    const effectiveMaxPlayers = parseInt(maxPlayers || (players ? players.length : 4));
    const isTwoPlayerDiagonal = effectiveMaxPlayers === 2;

    const [gameResult] = await pool.promise().execute(
        process.env.INSERT_GAME_WAITING,
        [colors[0], effectiveMaxPlayers]
    );

    const gameId = gameResult.insertId;

    if (players && players.length > 0) {
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const playerName = typeof player === 'object' ? player.name : player;
            const userId = typeof player === 'object' ? player.userId : player.user_id || null;

            let playerColor;
            if (isTwoPlayerDiagonal) {
                playerColor = i === 0 ? colors[0] : colors[2];
            } else {
                playerColor = colors[i];
            }

            await pool.promise().execute(
                process.env.INSERT_PLAYER_ACTIVE,
                [gameId, playerName, playerColor, userId]
            );

            const pawnValues = [];
            for (let j = 1; j <= 4; j++) {
                pawnValues.push([gameId, j, playerColor]);
            }

            await pool.promise().query(
                process.env.INSERT_PAWNS_BULK,
                [pawnValues]
            );
        }

        if (players.length > 1) {
            await pool.promise().execute(
                process.env.UPDATE_GAME_STATUS_PLAYING,
                [gameId]
            );
        }
    }

    return { gameId, effectiveMaxPlayers };
};

const fetchGameState = async (gameId) => {
    const [gameRows] = await pool.promise().execute(
        process.env.GET_GAME_STATE,
        [gameId]
    );

    const [pawnRows] = await pool.promise().execute(
        process.env.GET_PAWNS_BY_GAME,
        [gameId]
    );

    const [playerRows] = await pool.promise().execute(
        process.env.GET_PLAYERS_BY_GAME,
        [gameId]
    );

    const game = gameRows[0];
    const remainingTimeSeconds = game && game.remaining_seconds !== null ? Math.max(1, game.remaining_seconds) : 30;

    return {
        game: { ...game, remainingTimeSeconds },
        pawns: pawnRows,
        players: playerRows
    };
};

const getLobbyData = async (gameId) => {
    const [gameRows] = await pool.promise().execute(process.env.GET_GAME_LOBBY_DATA, [gameId]);
    return gameRows;
};

const getLobbyPlayers = async (gameId) => {
    const [dbPlayers] = await pool.promise().execute(process.env.GET_GAME_PLAYERS_LOBBY, [gameId]);
    return dbPlayers;
};

const startGame = async (gameId, players) => {
    await pool.promise().execute(
        process.env.UPDATE_GAME_STATUS_PLAYING,
        [gameId]
    );

    for (const player of players) {
        const [exists] = await pool.promise().execute(
            process.env.GET_GAME_PLAYER_BY_COLOR,
            [gameId, player.color]
        );

        if (exists.length === 0) {
            await pool.promise().execute(
                process.env.INSERT_GAME_PLAYER,
                [gameId, player.name, player.color, player.userId]
            );

            const pawnValues = [];
            for (let j = 1; j <= 4; j++) {
                pawnValues.push([gameId, j, player.color]);
            }
            await pool.promise().query(
                process.env.INSERT_PAWNS_BULK,
                [pawnValues]
            );
        } else {
            await pool.promise().execute(
                process.env.UPDATE_GAME_PLAYER_ACTIVE,
                [player.name, player.userId, gameId, player.color]
            );
        }
    }
};

const getChatHistory = async (gameId) => {
    const [messages] = await pool.promise().execute(
        process.env.GET_CHAT_HISTORY,
        [gameId]
    );
    return messages;
};

const saveChatMessage = async (gameId, player, color, text) => {
    await pool.promise().execute(
        process.env.INSERT_CHAT_MESSAGE,
        [gameId, player, color, text]
    );
};

const updatePlayerLives = async (gameId, color, lives) => {
    await pool.promise().execute(
        process.env.UPDATE_PLAYER_LIVES,
        [lives, gameId, color]
    );
};

const createWorldwideGame = async (preferredSize, players, colors) => {
    const [gameResult] = await pool.promise().execute(
        process.env.INSERT_NEW_GAME,
        [colors[0], preferredSize]
    );
    const gameId = gameResult.insertId;

    for (let i = 0; i < players.length; i++) {
        const matchedPlayer = players[i];
        const color = colors[i];

        await pool.promise().execute(
            process.env.INSERT_GAME_PLAYER,
            [gameId, matchedPlayer.playerName, color, matchedPlayer.userId]
        );

        const pawnValues = [];
        for (let j = 1; j <= 4; j++) {
            pawnValues.push([gameId, j, color]);
        }
        await pool.promise().query(
            process.env.INSERT_PAWNS_BULK,
            [pawnValues]
        );
    }
    return gameId;
};

module.exports = {
    processDiceRoll,
    processPawnMove,
    processQuitGame,
    initializeGame,
    fetchGameState,
    getLobbyData,
    getLobbyPlayers,
    startGame,
    getChatHistory,
    saveChatMessage,
    updatePlayerLives,
    createWorldwideGame
};



