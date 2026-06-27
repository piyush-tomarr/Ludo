import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './SplashScreen.module.css';
import splash from "../assets/splashscreen.webp"

import { useSound } from '../context/SoundContext';

import useTranslate from '../Util/ChangeLang';

const SplashScreen = () => {
    const navigate = useNavigate();
    const { initBgMusic } = useSound();
    const t = useTranslate();

    useEffect(() => {
        initBgMusic();
        // Navigate to main menu after 5 seconds
        const timer = setTimeout(() => {
            navigate('/menu');
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [navigate]);

    return (
        <div className={classes.splashContainer}>
            <div className={classes.splashContent}>
                {/* Ethio Ludo Logo */}
                <img
                    src={splash}
                    alt="Game Board"
                    style={{
                        width: "15rem",
                        height: "15rem",
                        objectFit: "contain",
                        borderRadius: "2rem",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        display: "block",
                        margin: "20px auto"
                    }}
                />


                {/* Loading Animation */}
                <div className={classes.loadingContainer}>
                    <div className={classes.loadingBar}>
                        <div className={classes.loadingProgress}></div>
                    </div>
                    <p className={classes.loadingText}>{t('Loading...')}</p>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
