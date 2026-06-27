import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './DiceRollingPage.module.css';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';

const DiceFace = ({ value, className }) => {

    const renderPips = (val) => {
        const pipMap = {
            1: [4],
            2: [0, 8],
            3: [0, 4, 8],
            4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8],
            6: [0, 2, 3, 5, 6, 8]
        };
        return Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={pipMap[val].includes(i) ? classes.pip : ''}></div>
        ));
    };
    return (
        <div className={`${classes.diceFace} ${className}`}>
            {renderPips(value)}
        </div>
    );
};

const Dice3D = ({ value, rolling }) => {
    return (
        <div className={`${classes.diceWrapper} ${rolling ? classes.diceRolling : ''}`}>
            <DiceFace value={value} className={classes.front} />
            <DiceFace value={6} className={classes.back} />
            <DiceFace value={3} className={classes.right} />
            <DiceFace value={4} className={classes.left} />
            <DiceFace value={5} className={classes.top} />
            <DiceFace value={2} className={classes.bottom} />
        </div>
    );
};

const DiceRollingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { initBgMusic, pauseBgMusic, resumeBgMusic } = useSound();
    const t = useTranslate();
    const { selectedOption, betAmount, currentHistory } = location.state || { 
        selectedOption: '7', 
        betAmount: 500, 
        currentHistory: Array(7).fill(null) 
    };

    const [isRolling, setIsRolling] = useState(true);
    const [result, setResult] = useState(null);
    const [diceValues, setDiceValues] = useState([1, 1]);
    const [showModal, setShowModal] = useState(false);
    const [updatedHistory, setUpdatedHistory] = useState(currentHistory);

    const options = [
        { id: '2-6', range: [2, 6], multiplier: 2 },
        { id: '7', range: [7, 7], multiplier: 3 },
        { id: '8-12', range: [8, 12], multiplier: 2 }
    ];

    useEffect(() => {
        pauseBgMusic();
        
        const rollDuration = 3000;
        const interval = setInterval(() => {
            setDiceValues([
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ]);
        }, 100);

        const timer = setTimeout(() => {
            clearInterval(interval);
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const sum = d1 + d2;
            setDiceValues([d1, d2]);

            const option = options.find(opt => opt.id === selectedOption);
            const isWin = sum >= option.range[0] && sum <= option.range[1];
            const winAmount = isWin ? betAmount * option.multiplier : 0;

            const finalResult = { sum, isWin, winAmount };
            setResult(finalResult);
            setIsRolling(false);
            
            // Update history: Add new result to front, remove last if > 7
            const newHistory = [{ value: sum, isWin }, ...currentHistory.slice(0, 6)];
            setUpdatedHistory(newHistory);
            
            setTimeout(() => {
                setShowModal(true);
            }, 1200);
        }, rollDuration);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
            resumeBgMusic();
        };
    }, [pauseBgMusic, resumeBgMusic]);


    const handleBack = () => {
        navigate('/lucky-7', { 
            state: { 
                updatedHistory,
                selectedOption,
                betAmount
            } 
        });
    };

    return (
        <div className={classes.rollingPage}>
            <div className={classes.statusHeader}>
                {isRolling ? (
                    <h1 className={classes.rollingText}>{t('Rolling Dice...')}</h1>
                ) : (
                    <h1 className={`${classes.resultText} ${result.isWin ? classes.win : classes.loss}`}>
                        {result.isWin ? t('YOU WON!') : t('YOU LOST!')}
                    </h1>
                )}
            </div>

            <div className={classes.boardContainer}>
                <div className={classes.board}>
                    <div className={classes.felt}>
                        <Dice3D value={diceValues[0]} rolling={isRolling} />
                        <Dice3D value={diceValues[1]} rolling={isRolling} />
                    </div>
                </div>
            </div>

            {showModal && (
                <div className={classes.overlay}>
                    <div className={classes.modal}>
                        <h2 className={result.isWin ? classes.win : classes.loss} style={{ fontSize: '2.5rem' }}>
                            {result.isWin ? t('CONGRATULATIONS!') : t('BETTER LUCK!')}
                        </h2>
                        <div style={{ fontSize: '2.2rem', margin: '1.5rem 0', fontWeight: 700 }}>{t('SUM:')} {result.sum}</div>
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff' }}>
                            {result.isWin ? `+${result.winAmount} ${t('COINS')}` : t('Next time for sure!')}
                        </div>
                        <button className={classes.collectBtn} onClick={handleBack}>
                            {result.isWin ? t('COLLECT COINS') : t('TRY AGAIN')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiceRollingPage;
