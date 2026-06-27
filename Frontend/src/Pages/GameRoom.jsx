import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Board from "../Components/Board";
import styles from "./GameRoom.module.css";
import { useSound } from "../context/SoundContext";

const GameRoom = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const playerName = location.state?.playerName;
  const { pauseBgMusic, resumeBgMusic } = useSound();

  useEffect(() => {
    // Stop background music when entering the game
    pauseBgMusic();

    // Coin Deduction Logic
    const handleDeduction = async () => {
      console.log('100 coins ud gye !')
      const shouldDeduct = location.state?.shouldDeduct;
      const deductionDoneKey = `deduction_done_${gameId}`;
      
      if (shouldDeduct && !sessionStorage.getItem(deductionDoneKey)) {
        const user = JSON.parse(localStorage.getItem('ludo_user') || 'null');
        if (user && user.id) {
          try {
            const { deductCoinsFun } = await import('../Services/ApiFun');
            await deductCoinsFun(user.id, 100);
            sessionStorage.setItem(deductionDoneKey, 'true');
            console.log(`[Economy] 100 coins deducted for game ${gameId}`);
          } catch (err) {
            console.error('[Economy] Failed to deduct coins:', err);
          }
        }
      }
    };

    handleDeduction();

    return () => {
      // Resume background music when leaving the game
      resumeBgMusic();
    };
  }, [gameId, location.state, pauseBgMusic, resumeBgMusic]);

  return (
    <div className={styles.container}>
      {gameId ? <Board gameId={gameId} playerName={playerName} playerColor={location.state?.playerColor} /> : <div>Error: Game ID missing</div>}
    </div>
  );
};

export default GameRoom;
