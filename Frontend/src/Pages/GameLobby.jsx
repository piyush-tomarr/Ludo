import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import socket from '../socket';
import { useSocket } from '../hooks/useSocket';
import classes from './GameLobby.module.css';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';
import { rewardCoinsFun } from '../Services/ApiFun';
import Avatar from 'react-avatar';

const GameLobby = () => {
    const navigate = useNavigate();
    const { pauseBgMusic, resumeBgMusic } = useSound();
    const t = useTranslate();

    useEffect(() => {
        pauseBgMusic();
        return () => {
            resumeBgMusic();
        };
    }, [pauseBgMusic, resumeBgMusic]);
    const { gameId } = useParams();
    const location = useLocation();
    const { playerName, isHost: initialIsHost, maxPlayers: initialMaxPlayers } = location.state || {};

    const [lobbyData, setLobbyData] = useState({
        players: [],
        maxPlayers: initialMaxPlayers || 4,
        hostId: '',
        gameStatus: 'waiting'
    });
    const [isHost, setIsHost] = useState(initialIsHost || false);
    const [error, setError] = useState('');

    // Socket event handlers
    const handleLobbyUpdate = (data) => {
        console.log('Lobby updated:', data);
        setLobbyData(prev => ({
            ...prev,
            players: data.players || [],
            maxPlayers: data.maxPlayers || prev.maxPlayers,
            hostId: data.hostId,
            gameStatus: data.gameStatus || prev.gameStatus
        }));

        // Find if this socket is the host
        if (data.hostId && socket) {
            setIsHost(data.hostId === socket.id);
        }
    };

    const handleGameStarted = (data) => {
        console.log('Game started navigating:', data);
        const myPlayer = lobbyData.players.find(p => p.id === socket?.id);
        navigate(`/game/${gameId}`, {
            state: {
                playerName,
                playerColor: myPlayer?.color,
                shouldDeduct: location.state?.shouldDeduct
            }
        });
    };

    const handleLobbyError = (data) => {
        setError(data.error);
        setTimeout(() => navigate('/online-mode'), 3000);
    };

    // Initialize socket connection
    const { } = useSocket(gameId, {
        onLobbyUpdate: handleLobbyUpdate,
        onGameStarted: handleGameStarted,
        onLobbyError: handleLobbyError
    });

    useEffect(() => {
        if (socket && socket.connected) {
            const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
            console.log('Joining lobby with:', { gameId, playerName, maxPlayers: lobbyData.maxPlayers, isHost, userId: loggedUser?.id });
            socket.emit('join_lobby', {
                gameId,
                playerName: playerName || 'Guest',
                maxPlayers: lobbyData.maxPlayers,
                isHost: isHost,
                userId: loggedUser?.id || null
            });
        }
    }, [socket, socket?.connected, gameId, playerName, lobbyData.maxPlayers, isHost]);

    const handleStartGame = () => {
        if (socket && lobbyData.players.length >= 2) {
            socket.emit('start_game', { gameId });
        }
    };

    const handleCopyGameId = () => {
        navigator.clipboard.writeText(gameId);
        const btn = document.getElementById('copy-lobby-btn');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = t('Copy') === 'ኮፒ' ? 'ኮፒ ተደርጓል!' : 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    };

    const handleLeaveGame = async () => {
        if (socket) {
            socket.emit('leave_lobby', { gameId });
        }
        
        // Refund coins when leaving before game starts
        try {
            const loggedUser = JSON.parse(localStorage.getItem('ludo_user') || 'null');
            if (loggedUser && loggedUser.id) {
                await rewardCoinsFun(loggedUser.id, 100);
            }
        } catch(err) {
            console.error('Refund failed on leave', err);
        }

        navigate('/online-mode');
    };

    const canStartGame = lobbyData.players.length >= 2 && isHost;
    const allPlayersJoined = lobbyData.players.length === lobbyData.maxPlayers;

    return (
        <div className={classes.container}>
            <div className={classes.background}>
                <div className={classes.circle}></div>
                <div className={classes.circle}></div>
            </div>

            <div className={classes.content}>
                <div className={classes.lobbyCard}>
                    {/* Header */}
                    <div className={classes.header}>
                        <div className={classes.statusBadge}>
                            <span className={classes.statusDot}></span>
                            {allPlayersJoined ? t('Ready to Start') : t('Waiting for Players')}
                        </div>
                        <h1 className={classes.title}>{t('Game Lobby')}</h1>
                        {error && (
                            <div className={classes.errorBox}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                {error}
                            </div>
                        )}
                        <p className={classes.subtitle}>
                            {allPlayersJoined
                                ? t('All players have joined!')
                                : `${t('Waiting for')} ${lobbyData.maxPlayers - lobbyData.players.length} ${t('more player(s)')}`}
                        </p>
                    </div>

                    {/* Game ID Section */}
                    <div className={classes.gameIdSection}>
                        <div className={classes.gameIdLabel}>{t('Game ID')}</div>
                        <div className={classes.gameIdBox}>
                            <span className={classes.gameId}>{gameId}</span>
                            <button
                                id="copy-lobby-btn"
                                className={classes.copyButton}
                                onClick={handleCopyGameId}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                </svg>
                                {t('Copy')}
                            </button>
                        </div>
                        <p className={classes.shareHint}>{t('Share this ID with your friends to join')}</p>
                    </div>

                    {/* Players List */}
                    <div className={classes.playersSection}>
                        <div className={classes.playersSectionHeader}>
                            <h3>{t('Players')} ({lobbyData.players.length}/{lobbyData.maxPlayers})</h3>
                        </div>
                        <div className={classes.playersList}>
                            {lobbyData.players.map((player, index) => (
                                <div key={index} className={classes.playerCard}>
                                    <div className={classes.playerAvatar}>
                                        <Avatar
                                            name={player.name}
                                            round={true}
                                            size="100%"
                                            src={player.avatar}
                                            color={player.color || Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
                                        />
                                    </div>
                                    <div className={classes.playerInfo}>
                                        <div className={classes.playerName}>{player.name || `${t('Player')} ${index + 1}`}</div>
                                        {index === 0 && <div className={classes.hostBadge}>{t('Host')}</div>}
                                    </div>
                                    <div className={classes.playerStatus}>
                                        <span className={classes.readyDot}></span>
                                        {t('Ready')}
                                    </div>
                                </div>
                            ))}

                            {/* Empty slots */}
                            {[...Array(lobbyData.maxPlayers - lobbyData.players.length)].map((_, index) => (
                                <div key={`empty-${index}`} className={classes.emptySlot}>
                                    <div className={classes.emptyAvatar}>?</div>
                                    <div className={classes.emptyText}>{t('Waiting for player...')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    {!allPlayersJoined && (
                        <div className={classes.instructions}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                            </svg>
                            <div>
                                <p className={classes.instructionTitle}>{t('How to invite friends:')}</p>
                                <p className={classes.instructionText}>
                                    {t('Share the Game ID above with your friends. They can join by clicking "Join Game" from the main menu and entering this ID.')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className={classes.buttonGroup}>
                        {isHost ? (
                            <button
                                className={classes.startButton}
                                onClick={handleStartGame}
                                disabled={!canStartGame}
                            >
                                {lobbyData.players.length < 2
                                    ? `${t('Need')} ${2 - lobbyData.players.length} ${t('More Player(s)')}`
                                    : t('Start Game')}
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        ) : (
                            <div className={classes.waitingMessage}>
                                <span className={classes.waitingSpinner}></span>
                                {t('Waiting for host to start the game...')}
                            </div>
                        )}

                        <button className={classes.leaveButton} onClick={handleLeaveGame}>
                            {t('Leave Lobby')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameLobby;
