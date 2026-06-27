import { useEffect, useRef, useCallback } from 'react';
import socket from '../socket';
import { logger } from '../Util/logger';

export const useSocket = (gameId, handlers = {}, myColor = null) => {
    const handlersRef = useRef(handlers);

    // Keep handlers ref updated
    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (!gameId) return;

        // Sync player identity with the server.
        socket.emit('join_game', { gameId, color: myColor });
        logger.debug(`Syncing socket with game room: game_${gameId} [Identity: ${myColor || 'Spectator'}]`);
    }, [gameId, myColor]);

    useEffect(() => {
        if (!gameId) return;

        const handleDiceRolled = (data) => {
            logger.debug('Dice rolled event:', data);
            if (handlersRef.current.onDiceRolled) {
                handlersRef.current.onDiceRolled(data);
            }
        };

        const handlePawnMoved = (data) => {
            logger.debug('Pawn moved event:', data);
            if (handlersRef.current.onPawnMoved) {
                handlersRef.current.onPawnMoved(data);
            }
        };

        const handleGameStateUpdated = (data) => {
            logger.debug('Game state updated:', data);
            if (handlersRef.current.onGameStateUpdated) {
                handlersRef.current.onGameStateUpdated(data);
            }
        };

        const handleLobbyUpdate = (data) => {
            logger.debug('Lobby update:', data);
            if (handlersRef.current.onLobbyUpdate) {
                handlersRef.current.onLobbyUpdate(data);
            }
        };

        const handleGameStarted = (data) => {
            logger.debug('Game started:', data);
            if (handlersRef.current.onGameStarted) {
                handlersRef.current.onGameStarted(data);
            }
        };

        const handleLobbyError = (data) => {
            logger.error('Lobby error:', data);
            if (handlersRef.current.onLobbyError) {
                handlersRef.current.onLobbyError(data);
            }
        };

        const handleDiceRollError = (data) => {
            logger.error('Socket dice roll error:', data);
            if (handlersRef.current.onDiceRollError) {
                handlersRef.current.onDiceRollError(data);
            }
        };

        const handlePawnMoveError = (data) => {
            logger.error('Socket pawn move error:', data);
            if (handlersRef.current.onPawnMoveError) {
                handlersRef.current.onPawnMoveError(data);
            }
        };

        const handlePlayerQuit = (data) => {
            logger.debug('Player quit event:', data);
            if (handlersRef.current.onPlayerQuit) {
                handlersRef.current.onPlayerQuit(data);
            }
        };

        const handleGameOver = (data) => {
            logger.debug('Game over event:', data);
            if (handlersRef.current.onGameOver) {
                handlersRef.current.onGameOver(data);
            }
        };

        // Keep one listener set per game so duplicate socket events do not stack.
        logger.debug(`Registering socket listeners for game_${gameId}`);
        socket.on('dice_rolled', handleDiceRolled);
        socket.on('pawn_moved', handlePawnMoved);
        socket.on('game_state_updated', handleGameStateUpdated);
        socket.on('lobby_update', handleLobbyUpdate);
        socket.on('game_started', handleGameStarted);
        socket.on('lobby_error', handleLobbyError);
        socket.on('dice_roll_error', handleDiceRollError);
        socket.on('pawn_move_error', handlePawnMoveError);
        socket.on('player_quit', handlePlayerQuit);
        socket.on('game_over', handleGameOver);

        // Cleanup on unmount or gameId change
        return () => {
            logger.debug(`Unregistering socket listeners for game room: game_${gameId}`);
            socket.emit('leave_game', gameId);
            socket.off('dice_rolled', handleDiceRolled);
            socket.off('pawn_moved', handlePawnMoved);
            socket.off('game_state_updated', handleGameStateUpdated);
            socket.off('lobby_update', handleLobbyUpdate);
            socket.off('game_started', handleGameStarted);
            socket.off('lobby_error', handleLobbyError);
            socket.off('dice_roll_error', handleDiceRollError);
            socket.off('pawn_move_error', handlePawnMoveError);
            socket.off('player_quit', handlePlayerQuit);
            socket.off('game_over', handleGameOver);
        };
    }, [gameId]);

    // Function to request dice roll via socket
    const requestDiceRoll = useCallback((color, isAuto = false) => {
        if (socket && socket.connected) {
            logger.debug(`Requesting dice roll via socket for ${color} in game ${gameId} (isAuto: ${isAuto})`);
            socket.emit('request_roll_dice', { gameId, color, isAuto });
            return true;
        } else {
            logger.error('Socket not connected or invalid socket state', { isConnected: socket?.connected, gameId });
            return false;
        }
    }, [gameId]);

    // Function to request pawn move via socket
    const requestMovePawn = useCallback((pawnId) => {
        if (socket && socket.connected) {
            logger.debug(`Requesting pawn move for ${pawnId} via socket`);
            socket.emit('request_move_pawn', { gameId, pawnId });
            return true;
        } else {
            logger.error('Socket not connected, cannot move pawn');
            return false;
        }
    }, [gameId]);

    // Function to quit game via socket
    const quitGame = useCallback((color) => {
        if (socket && socket.connected) {
            logger.debug(`Requesting quit game for ${color} via socket`);
            socket.emit('quit_game', { gameId, color: color || myColor });
        } else {
            logger.error('Socket not connected, cannot quit game');
        }
    }, [gameId, myColor]);

    // Expose socket for manual operations if needed
    return {
        socket,
        isConnected: socket.connected,
        requestDiceRoll,
        requestMovePawn,
        quitGame
    };
};

export default useSocket;
