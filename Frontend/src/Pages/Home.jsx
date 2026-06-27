import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createGame, deductCoinsFun } from "../Services/ApiFun";
import classes from "./Home.module.css";
import { useSound } from "../context/SoundContext";
import useTranslate from "../Util/ChangeLang";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerCount = location.state?.playerCount || 4;
  const isComputerGame = location.state?.isComputerGame;
  const isLocalGame = location.state?.isLocalGame;
  const { initBgMusic } = useSound();
  const t = useTranslate();

  useEffect(() => {
    initBgMusic();
  }, [initBgMusic]);

  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Standard color order: Red, Green, Yellow, Blue
    // 2 players: Red (0) & Yellow (2) are opposite
    const basePlayers = [
      { id: 0, color: "#f44336", label: t("Red"), defaultName: isComputerGame ? t("You") : t("Player 1") },
      { id: 1, color: "#4caf50", label: t("Green"), defaultName: isComputerGame ? t("Bot 1") : t("Player 2") },
      { id: 2, color: "#fad416", label: t("Yellow"), defaultName: isComputerGame ? t("Bot 2") : t("Player 3") },
      { id: 3, color: "#2196f3", label: t("Blue"), defaultName: isComputerGame ? t("Bot 3") : t("Player 4") },
    ];

    let activeSet = [];
    if (playerCount === 2) {
      //skipped one color because of the board  
      activeSet = [
        { ...basePlayers[0], name: isComputerGame ? t("You") : t("Player 1"), label: t("Red") },
        { ...basePlayers[2], name: isComputerGame ? t("Bot 2") : t("Player 2"), label: t("Yellow") }
      ];
    } else {
      // 3 or 4 players: Sequential
      activeSet = basePlayers.slice(0, playerCount).map(p => ({ ...p, name: p.defaultName }));
    }
    setPlayers(activeSet);
  }, [playerCount, isComputerGame, t]);

  const handleInputChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index].name = value;
    setPlayers(newPlayers);
  };

  const handleStartGame = async (e) => {
    e.preventDefault();

    const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");

    const playerList = players.slice(0, playerCount).map((p, idx) => {
      const name = p.name.trim() || p.defaultName;
      // If it's the first player (the user) and they are logged in, send their ID
      if (idx === 0 && loggedUser) {
        return { name, userId: loggedUser.id };
      }
      return { name, userId: null };
    });

    setIsLoading(true);
    try {
      const gameId = await createGame(playerList);
      if (gameId) {
        navigate(`/game/${gameId}`, {
          state: {
            playerName: playerList[0].name,
            playerColor:players[0].color,
            isComputerGame: isComputerGame,
            isLocalGame: isLocalGame,
            shouldDeduct: isComputerGame && loggedUser // Only deduct if it's vs computer and user is logged in
          }
        });
      }
    } catch (err) {
      console.error("Failed to create game:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      {/* Back Button */}
      <button className={classes.backButton} onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <span>{t('Back')}</span>
      </button>

      <div className={classes.glassCard}>
        <h1 className={classes.title}>{t('Ethio Ludo')}</h1>
        <p className={classes.subtitle}>{t('Enter Player Names to Start')}</p>

        <div className={classes.playerCountBadge}>
          <span className={classes.badgeIcon}>👥</span>
          <span>{playerCount} {t(' Players Game')}</span>
        </div>

        <form onSubmit={handleStartGame} className={classes.form}>
          <div className={classes.inputGrid}>
            {players.map((player, index) => (
              <div key={index} className={classes.inputGroup}>
                <label
                  className={classes.label}
                  style={{ color: player.color }}
                >
                  {player.label}
                </label>
                <input
                  type="text"
                  placeholder={t("Enter Name...")}
                  value={player.name}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className={classes.input}
                  style={{ borderLeft: `5px solid ${player.color}` }}
                  disabled={isComputerGame && index !== 0}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className={classes.startButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={classes.spinner}></span>
                {t('Creating Game...')}
              </>
            ) : (
              <>
                {t('START GAME')}
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
