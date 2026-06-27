import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import classes from "./Leaderboard.module.css";
import { fetchLeaderboardFun } from "../Services/ApiFun";
import useTranslate from "../Util/ChangeLang";

const Leaderboard = () => {
    const navigate = useNavigate();
    const t = useTranslate();
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const leaderboardRes = await fetchLeaderboardFun();
                setPlayers(leaderboardRes.leaderboard || []);
            } catch (err) {
                setError(t("Something went wrong. Please try again."));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [t]);

    return (
        <div className={classes.container}>
            <button className={classes.backButton} onClick={() => navigate("/menu")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="20">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t('Back')}</span>
            </button>

            <div className={classes.titleWrapper}>
                <span className={classes.titleBadge}>🏆</span>
                <h1 className={classes.mainTitle}>{t('LEADERBOARD')}</h1>
                <span className={classes.titleBadge}>🏆</span>
            </div>

            <div className={classes.leaderboardFrame}>
                <div className={classes.tableHeader}>
                    <span>{t('RANK')}</span>
                    <span>{t('NAME')}</span>
                    <span>{t('UID')}</span>
                    <span className={classes.hideOnMobile}>{t('WINS')}</span>
                    <span>{t('MATCHES')}</span>
                    <span>{t('WINRATE')}</span>
                </div>

                <div className={classes.listArea}>
                    {isLoading ? (
                        <div className={classes.loading}>{t('Loading Champions...')}</div>
                    ) : error ? (
                        <div className={classes.error}>{error}</div>
                    ) : (
                        players.map((player, index) => (
                            <div key={player.id} className={classes.playerRow} style={{ animationDelay: `${index * 50}ms` }}>
                                <div className={classes.rankCol}>
                                    #{index + 1}
                                </div>

                                <div className={classes.nameCol}>
                                    <div className={classes.diamondAvatar}>
                                        <Avatar
                                            name={player.username}
                                            round={true}
                                            size="100%"
                                            src={player.avatar}
                                            color={Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
                                        />
                                    </div>
                                    <span className={classes.playerName}>{player.username}</span>
                                </div>

                                <div className={classes.idCol}>
                                    #{String(player.id).padStart(5, '0')}
                                </div>

                                <div className={`${classes.scoreCol} ${classes.hideOnMobile}`}>
                                    {player.wins?.toLocaleString()}
                                </div>

                                <div className={classes.matchesCol}>
                                    {player.total_games}
                                </div>

                                <div className={classes.rateCol}>
                                    {((player.wins / (player.total_games || 1)) * 100).toFixed(1)}%
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
