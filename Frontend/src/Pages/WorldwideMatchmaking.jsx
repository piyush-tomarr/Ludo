import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import classes from './WorldwideMatchmaking.module.css';
import { useSound } from '../context/SoundContext';
import { fetchProfileFun, deductCoinsFun, rewardCoinsFun } from '../Services/ApiFun';
import useTranslate from '../Util/ChangeLang';
import Avatar from 'react-avatar';

const WorldwideMatchmaking = () => {
    const navigate = useNavigate();
    const { pauseBgMusic, resumeBgMusic } = useSound();
    const t = useTranslate();
    const [status, setStatus] = useState(() => sessionStorage.getItem('matchmaking_status') || 'selecting'); // selecting, searching, matched, idle
    const [playerCount, setPlayerCount] = useState(() => parseInt(sessionStorage.getItem('matchmaking_playerCount')) || 2);
    const [queueLength, setQueueLength] = useState(0);
    const [totalOnline, setTotalOnline] = useState(0);
    const [seconds, setSeconds] = useState(() => {
        const startTime = sessionStorage.getItem('matchmaking_startTime');
        if (startTime && (sessionStorage.getItem('matchmaking_status') === 'searching')) {
            const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
            return elapsed > 0 ? elapsed : 0;
        }
        return 0;
    });
    const [matchedInfo, setMatchedInfo] = useState(null);
    const [matchCountdown, setMatchCountdown] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [userCoins, setUserCoins] = useState(0);
    const [currentQueuePlayers, setCurrentQueuePlayers] = useState([]);

    useEffect(() => {
        pauseBgMusic();
        const loadUser = async () => {
            const user = JSON.parse(localStorage.getItem('ludo_user') || 'null');
            if (!user) {
                navigate('/auth', { state: { from: '/online/matchmaking' }, replace: true });
                return;
            }

            setCurrentUser({
                id: user.id,
                name: user.name || user.username,
                avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || user.name}`
            });

            // Fetch real coins from DB
            try {
                const profile = await fetchProfileFun(user.id);
                setUserCoins(profile.user.coins);
            } catch (err) {
                console.error("Failed to fetch coins", err);
            }
        };
        loadUser();
        
        return () => {
            resumeBgMusic();
        };
    }, [pauseBgMusic, resumeBgMusic, navigate]);

    useEffect(() => {
        let timer;
        if (status === 'searching') {
            if (seconds >= 120) {
                setStatus('timeout');
                setShowTimeoutModal(true);
                return;
            }
            timer = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else if (status === 'matched') {
            setMatchCountdown(3);
            timer = setInterval(() => {
                setMatchCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status, seconds, navigate]);

    const startSearch = async (count) => {
        const entryFee = 100;

        if (userCoins < entryFee) {
            alert(`${t('Insufficient Coins!')} ${t('You need')} ${entryFee} ${t('coins to play Worldwide.')}`);
            return;
        }

        try {
            // Start matchmaking
            setPlayerCount(count);
            setCurrentQueuePlayers([]); // Clear previous players
            setStatus('searching');
            setSeconds(0);
        } catch (err) {
            alert(err.message || t("Something went wrong. Please try again."));
        }
    };

    const playerCountRef = useRef(playerCount);
    const currentUserRef = useRef(currentUser);

    useEffect(() => { playerCountRef.current = playerCount; }, [playerCount]);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    useEffect(() => {
        if (status === 'selecting') return;

        const handleMatchmakingStatus = (data) => {
            console.log(`📡 [Status] Target=${playerCountRef.current} (${typeof playerCountRef.current}), Incoming=${data.size} (${typeof data.size}), Players Count=${data.players?.length}`);
            if (data.size == playerCountRef.current) {
                setQueueLength(data.queueLength);
                if (data.players) setCurrentQueuePlayers(data.players);
            }
            if (data.totalSearchers !== undefined) setTotalOnline(data.totalSearchers);
        };

        const handleQueueUpdate = (data) => {
            console.log(`📡 [Update] Target=${playerCountRef.current} (${typeof playerCountRef.current}), Incoming=${data.size} (${typeof data.size}), Players Count=${data.players?.length}`);
            if (data.size == playerCountRef.current) {
                setQueueLength(data.length);
                if (data.players) {
                    console.log('👥 Current Players in Queue:', data.players);
                    setCurrentQueuePlayers(data.players);
                }
            }
            if (data.totalSearchers !== undefined) setTotalOnline(data.totalSearchers);
        };

        const handleMatchFound = (data) => {
            console.log('🏁 Match found!', data);
            setStatus('matched');
            setMatchedInfo(data);

            // Cleanup on match
            sessionStorage.removeItem('matchmaking_status');
            setTimeout(() => {
                navigate(`/game/${data.gameId}`, {
                    state: { playerName: data.playerName, playerColor: data.color, isWorldwide: true, shouldDeduct: true }
                });
            }, 3000);
        };

        const handleMatchmakingError = (data) => {
            console.error('Matchmaking error:', data);
            alert(data.error || t('Something went wrong. Please try again.'));
            setStatus('selecting');
        };

        socket.on('matchmaking_status', handleMatchmakingStatus);
        socket.on('queue_update', handleQueueUpdate);
        socket.on('match_found', handleMatchFound);
        socket.on('matchmaking_error', handleMatchmakingError);

        return () => {
            socket.off('matchmaking_status', handleMatchmakingStatus);
            socket.off('queue_update', handleQueueUpdate);
            socket.off('match_found', handleMatchFound);
            socket.off('matchmaking_error', handleMatchmakingError);
        };
    }, [navigate, status, playerCount, socket, t]);

    useEffect(() => {
        if (status === 'searching' && socket.connected) {
            const playerName = currentUser?.name || `Guest_${Math.floor(Math.random() * 1000)}`;
            const userId = currentUser?.id || null;
            const avatar = currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}`;

            console.log("🔄 Re-syncing matchmaking after refresh...");
            socket.emit('find_match', { playerName, userId, playerCount, avatar });
        }
    }, [status, playerCount, currentUser]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCancel = async () => {
        sessionStorage.removeItem('matchmaking_status');
        sessionStorage.removeItem('matchmaking_playerCount');
        sessionStorage.removeItem('matchmaking_startTime');
        socket.emit('cancel_match');
        navigate('/menu');
    };

    return (
        <div className={classes.container}>
            <div className={classes.background}>
                <div className={classes.circle}></div>
                <div className={classes.circle}></div>
            </div>

            <button className={classes.backButton} onClick={() => navigate('/menu')}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span>{t('Back')}</span>
            </button>

            <div className={classes.content}>
                {status === 'selecting' && (
                    <div className={classes.matchCard}>
                        <div className={classes.selectionSection}>
                            <div className={classes.walletBadge}>
                                <span className={classes.walletIcon}>🪙</span>
                                <span className={classes.walletVal}>{userCoins?.toLocaleString()}</span>
                            </div>

                            <h1 className={classes.title}>{t('Tournament Play')}</h1>
                            <p className={classes.selectionSubtitle}>{t('Entry Fee')}: <span className={classes.feeHighlight}>100 {t('Coins')}</span></p>

                            <div className={classes.selectionButtons}>
                                <button className={classes.selectionBtn} onClick={() => startSearch(2)}>
                                    <div className={classes.btnIcon}>👥</div>
                                    <div className={classes.btnLabel}>{t('2 Players')}</div>
                                    <div className={classes.btnExtra}>{t('Entry')}: 100 🪙</div>
                                </button>
                                <button className={classes.selectionBtn} onClick={() => startSearch(3)}>
                                    <div className={classes.btnIcon}>👥<span>👤</span></div>
                                    <div className={classes.btnLabel}>{t('3 Players')}</div>
                                    <div className={classes.btnExtra}>{t('Entry')}: 100 🪙</div>
                                </button>
                                <button className={classes.selectionBtn} onClick={() => startSearch(4)}>
                                    <div className={classes.btnIcon}>👥<span>👥</span></div>
                                    <div className={classes.btnLabel}>{t('4 Players')}</div>
                                    <div className={classes.btnExtra}>{t('Entry')}: 100 🪙</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {(status === 'searching' || status === 'matched' || status === 'timeout') && (
                    <div className={classes.searchingLayout}>
                        {/* ONLINE MULTIPLAYER TABLE (Image Request) */}
                        <div className={classes.tableHeader}>
                            <div className={classes.tableTitle}>{t('ONLINE MULTIPLAYER')}</div>
                            <div className={classes.tableGrid}>
                                <div className={classes.tableCol}>
                                    <div className={classes.colLabel}>{t('Game Mode')}</div>
                                    <div className={classes.colVal}>
                                        <span className={classes.trophy}>🏆</span> {t('Classic')}
                                    </div>
                                </div>
                                <div className={classes.tableCol}>
                                    <div className={classes.colLabel}>{t('Entry Amount')}</div>
                                    <div className={classes.colVal} style={{ color: '#ffd700' }}>100</div>
                                </div>
                            </div>
                        </div>

                        {/* VS SCREEN (Image Request) */}
                        <div className={classes.vsContainer}>
                            <div className={classes.playerBox}>
                                <div className={classes.playerAvatar}>
                                    <Avatar
                                        name={currentUser?.name || t("YOU")}
                                        round={true}
                                        size="100%"
                                        src={currentUser?.avatar}
                                        color={Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
                                    />
                                </div>
                                <div className={classes.playerName}>{currentUser?.name || t("YOU")}</div>
                            </div>

                            <div className={classes.vsCenter}>
                                <div className={classes.vsText}>VS</div>
                                <div className={classes.pulseGlow}></div>
                            </div>

                            {status === 'matched' && matchedInfo?.allPlayers ? (
                                <div className={classes.opponentsList}>
                                    {matchedInfo.allPlayers
                                        .filter(p => p.name !== (currentUser?.name || matchedInfo.playerName))
                                        .map((opp, idx) => (
                                            <div key={idx} className={classes.playerBox}>
                                                <div className={classes.playerAvatar} style={{ borderColor: opp.color }}>
                                                    <Avatar
                                                        name={opp.name}
                                                        round={true}
                                                        size="100%"
                                                        src={opp.avatar}
                                                        color={opp.color || Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
                                                    />
                                                </div>
                                                <div className={classes.playerName}>{opp.name}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            ) : (
                                <div className={classes.opponentsList}>
                                    {[...Array(playerCount - 1)].map((_, i) => {
                                        // Filter queue to find all OTHER players (opponents) using unique socket.id
                                        const myNormalizedName = (currentUser?.name || "").trim().toLowerCase();
                                        const opponents = currentQueuePlayers.filter(p => {
                                            // Primary filter: Socket ID
                                            if (socket && p.id === socket.id) return false;

                                            // Secondary filter: Name (if ID check somehow misses or for local identity)
                                            const pName = (p.playerName || "").trim().toLowerCase();
                                            return pName && (pName !== myNormalizedName);
                                        });
                                        const opp = opponents[i];

                                        if (opp) {
                                            return (
                                                <div key={`opp-${i}`} className={classes.playerBox}>
                                                    <div className={classes.playerAvatar}>
                                                        <Avatar
                                                            name={opp.playerName}
                                                            round={true}
                                                            size="100%"
                                                            src={opp.avatar}
                                                            color={Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
                                                        />
                                                    </div>
                                                    <div className={classes.playerName}>{opp.playerName}</div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={`searching-${i}`} className={classes.playerBox}>
                                                    <div className={classes.playerAvatar}>
                                                        <div className={classes.searchingIcon}>?</div>
                                                    </div>
                                                    <div className={classes.playerName}>{t('Searching')}...</div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            )}
                        </div>

                        {/* SEARCHING PANEL */}
                        <div className={classes.bottomSearchPanel}>
                            <h2 className={classes.searchTitle}>
                                {status === 'searching' ? t('LOOKING FOR MASTER PLAYERS...') : status === 'matched' ? t('PLAYER CONNECTED!') : t('SEARCH TIMEOUT')}
                            </h2>

                            <div className={classes.searchStats}>
                                <div className={classes.statItem}>
                                    <span className={classes.sStat}>{t('Lobby')}: {queueLength}/{playerCount}</span>
                                    <span className={classes.sStat}>{t('Active')}: {totalOnline}</span>
                                    <span className={classes.sStat}>{t('Time')}: {formatTime(120 - seconds)}</span>
                                </div>
                            </div>

                            <button className={classes.cancelButton} onClick={handleCancel}>
                                {status === 'matched' ? t('PREPARING GAME...') : t('CANCEL SEARCH')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* TIMEOUT MODAL */}
            {showTimeoutModal && (
                <div className={classes.modalOverlay}>
                    <div className={classes.timeoutModal}>
                        <div className={classes.timeoutIcon}>⏳</div>
                        <h2 className={classes.timeoutTitle}>{t('No Player Found!')}</h2>
                        <p className={classes.timeoutText}>
                            {t("We couldn't find anyone worldwide to play with you right now.")}<br />
                            {t("Please try again later.")}
                        </p>
                        <button className={classes.timeoutBtn} onClick={() => navigate('/menu')}>
                            {t('Return to Menu')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorldwideMatchmaking;
