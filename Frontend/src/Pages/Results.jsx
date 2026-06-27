import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import classes from "./Results.module.css";
import { useSound } from "../context/SoundContext";
import confetti from 'canvas-confetti';
import happyEmoji from '../assets/happy_dice_emoji.webp';
import sadEmoji from '../assets/sad_dice_emoji.webp';
import coinIcon from '../assets/gold_coin_icon.webp';

// ðŸ‘¨â€ðŸŽ¨ Helper to ensure color consistency
const normalizeColor = (color) => {
    if (!color) return color;
    const lower = color.trim().toLowerCase();
    if (lower === "#fad416") return "#fad416";
    return lower;
};

import useTranslate from "../Util/ChangeLang";

const Results = () => {
    const t = useTranslate();
    const location = useLocation();
    const navigate = useNavigate();
    const {
        winnerName,
        winnerColor,
        gameResult, // 'win' or 'loss'
        gameId,
        players = [],
        rankings = [],
        prizes = {},
        isComputerGame,
        isLocalGame
    } = location.state || {};

    const handleTryAgain = () => {
        if (isComputerGame) {
            navigate("/vs-computer");
        } else if (isLocalGame) {
            navigate("/player-count");
        } else {
            navigate("/online-mode");
        }
    };


    const { initBgMusic } = useSound();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        initBgMusic();
        const timer = setTimeout(() => setShowContent(true), 500);

        if (gameResult === 'win') {
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ffd700', '#f44336', '#4caf50', '#2196f3']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ffd700', '#f44336', '#4caf50', '#2196f3']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }

        return () => clearTimeout(timer);
    }, [initBgMusic, gameResult]);

    if (!location.state) {
        return (
            <div className={classes.container}>
                <div className={classes.errorCard}>
                    <h2>{t('No Game Data Found')}</h2>
                    <button onClick={() => navigate("/")} className={classes.homeButton}>{t('Return Home')}</button>
                </div>
            </div>
        );
    }

    const localPlayerName = localStorage.getItem('ludo_player_name') || "";
    const myNormalizedColor = (location.state?.players?.find(p => p.name === localPlayerName || p.id === localStorage.getItem('ludo_user_id'))?.color || "").toLowerCase();
    const myRankItem = rankings.find(r => r.color?.toLowerCase() === myNormalizedColor || r.name === localPlayerName);
    const myRank = myRankItem?.rank || (gameResult === 'win' ? 1 : 4);

    return (
        <div className={classes.container}>
            {/* 🌌 Atmospheric Tech Background */}
            <div className={classes.techBackground}></div>
            <div className={classes.circleGlow}></div>

            {/* 🏆 Header: YOU WON / YOU LOST */}
            <div className={classes.resultHeader}>
                <div className={classes.emojiContainer}>
                    <img 
                        src={myRank === 1 ? happyEmoji : sadEmoji} 
                        alt="Result Emoji" 
                        className={classes.resultEmoji} 
                    />
                </div>
                <h1 className={myRank === 1 ? classes.youWon : classes.youLost}>
                    {myRank === 1 ? t('YOU WON!') : t('GAME OVER')}
                </h1>
                <p className={classes.superstarTag}>
                    {myRank === 1 ? t('Ultimate Ludo Superstar Champion!') : t('Better luck next time, Superstar!')}
                </p>
            </div>

            {/* ðŸŽ–ï¸ WINNER Label (Only for 1st Rank) */}
            <div className={classes.winnerBadgeContainer}>
                <div className={classes.winnerBox}>
                    <span className={classes.winnerLabel}>{t('WINNER')}</span>
                </div>
            </div>

            {/* 📜 Rankings List */}
            <div className={classes.rankingsList}>
                {(rankings && rankings.length > 0 ? rankings : players).map((player, index) => {
                    const rank = player.rank || index + 1;
                    const isMe = (player.name === localPlayerName || normalizeColor(player.color) === myNormalizedColor);
                    const playerColor = normalizeColor(player.color);
                    const isRanked = rank <= 3;
                    const rankClass = rank === 1 ? classes.rank1 : rank === 2 ? classes.rank2 : rank === 3 ? classes.rank3 : classes.rankOther;

                    return (
                        <div key={player.color || index} className={`${classes.rankCard} ${rankClass}`}>
                            {/* Trophy / Rank Num */}
                            <div className={classes.trophyContainer}>
                                <span className={classes.trophyEmoji}>
                                    {rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''}
                                </span>
                                <span className={classes.trophyRank}>{rank}</span>
                            </div>

                            {/* Avatar */}
                            <div className={classes.avatarWrapper} style={{ borderColor: playerColor }}>
                                <img 
                                    className={classes.avatarImg} 
                                    src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name || index}`} 
                                    alt="Avatar" 
                                />
                            </div>

                            {/* Name & Score */}
                            <div className={classes.playerDetails}>
                                <div className={classes.playerName}>
                                    {isMe ? `${t('YOU')} (${player.name})` : player.name}
                                </div>
                                <div className={classes.playerScore}>
                                    {player.status === 'quit' || player.status === 'left' ? t('QUIT') : (
                                        <>
                                            {((prizes && rank === 1 ? prizes.first : rank === 2 ? prizes.second : 0) || (rank === 1 ? 180 : 0)).toLocaleString()} 
                                            <img src={coinIcon} alt="Coin" className={classes.scoreCoinIcon} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 🎮 Bottom Actions */}
            <div className={classes.actions}>
                <button className={`${classes.actionBtn} ${classes.primaryBtn}`} onClick={handleTryAgain}>
                    {t('TRY AGAIN')}
                </button>
                <button className={`${classes.actionBtn} ${classes.secondaryBtn}`} onClick={() => navigate("/menu")}>
                    {t('HOME')}
                </button>
            </div>
        </div>
    );
};

export default Results;
