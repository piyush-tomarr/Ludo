import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import clickSoundPath from '../Sounds/button_click.mp3';
import backgroundMusicPath from '../Sounds/background.mp3';
import gameStartSoundPath from '../Sounds/ludoking_start.mp3';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
    const [isMusicMuted, setIsMusicMuted] = useState(() => {
        const saved = localStorage.getItem('game_music_muted');
        return saved === 'true';
    });

    const [isMusicPaused, setIsMusicPaused] = useState(false);

    const [isSfxMuted, setIsSfxMuted] = useState(() => {

        const saved = localStorage.getItem('game_sfx_muted');
        return saved === 'true';
    });

    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('game_music_volume');
        return saved !== null ? parseFloat(saved) : 0.4;
    });

    const [sfxVolume, setSfxVolume] = useState(() => {
        const saved = localStorage.getItem('game_sfx_volume');
        return saved !== null ? parseFloat(saved) : 0.6;
    });

    const clickSoundRef = useRef(new Audio(clickSoundPath));
    const gameStartSoundRef = useRef(new Audio(gameStartSoundPath));
    const bgMusicRef = useRef(new Audio(backgroundMusicPath));

    useEffect(() => {
        const bgMusic = bgMusicRef.current;
        bgMusic.loop = true;
        bgMusic.volume = musicVolume;
        bgMusic.autoplay = true;

        const attemptPlay = () => {
            if (isMusicMuted || isMusicPaused) {
                bgMusic.pause();
                return;
            }


            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    console.log("Waiting for user interaction to start background music...");
                });
            }
        };

        attemptPlay();

        const unblockAudio = () => {
            if (!isMusicMuted && !isMusicPaused && bgMusic.paused) {
                attemptPlay();
            }
        };


        const handleVisibilityChange = () => {
            if (document.hidden) {
                bgMusic.pause();
            } else {
                if (!isMusicMuted && !isMusicPaused) {
                    bgMusic.play().catch(() => {

                        console.log("Waiting for user interaction to resume background music...");
                    });
                }
            }
        };

        window.addEventListener('click', unblockAudio);
        window.addEventListener('keydown', unblockAudio);
        window.addEventListener('touchstart', unblockAudio);
        window.addEventListener('mousedown', unblockAudio);
        window.addEventListener('mousemove', unblockAudio, { once: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('click', unblockAudio);
            window.removeEventListener('keydown', unblockAudio);
            window.removeEventListener('touchstart', unblockAudio);
            window.removeEventListener('mousedown', unblockAudio);
            window.removeEventListener('mousemove', unblockAudio);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isMusicMuted, isMusicPaused, musicVolume]);


    useEffect(() => {
        localStorage.setItem('game_music_muted', isMusicMuted);
    }, [isMusicMuted]);

    useEffect(() => {
        localStorage.setItem('game_sfx_muted', isSfxMuted);
    }, [isSfxMuted]);

    useEffect(() => {
        localStorage.setItem('game_music_volume', musicVolume);
        bgMusicRef.current.volume = musicVolume;
    }, [musicVolume]);

    useEffect(() => {
        localStorage.setItem('game_sfx_volume', sfxVolume);
    }, [sfxVolume]);

    const playClickSound = useCallback(() => {
        if (isSfxMuted || document.hidden) return;
        const sound = clickSoundRef.current;
        sound.currentTime = 0;
        sound.volume = sfxVolume;
        sound.play().catch(e => console.log("Click sound blocked:", e));
    }, [isSfxMuted, sfxVolume]);

    const playGameStartSound = useCallback(() => {
        if (isSfxMuted || document.hidden) return;
        const sound = gameStartSoundRef.current;
        sound.currentTime = 0;
        sound.volume = sfxVolume;
        sound.play().catch(e => console.log("Game start sound blocked:", e));
    }, [isSfxMuted, sfxVolume]);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            const button = e.target.closest('button');
            if (button) {
                playClickSound();
            }
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [playClickSound]);

    const toggleMusic = () => setIsMusicMuted(prev => !prev);
    const toggleSfx = () => setIsSfxMuted(prev => !prev);

    const pauseBgMusic = useCallback(() => setIsMusicPaused(true), []);
    const resumeBgMusic = useCallback(() => setIsMusicPaused(false), []);

    const initBgMusic = useCallback(() => {
        const bgMusic = bgMusicRef.current;
        if (!isMusicMuted && !isMusicPaused && bgMusic.paused) {
            bgMusic.play().catch(() => { });
        }
    }, [isMusicMuted, isMusicPaused]);


    return (
        <SoundContext.Provider value={{
            isMusicMuted,
            isSfxMuted,
            musicVolume,
            sfxVolume,
            setMusicVolume,
            setSfxVolume,
            toggleMusic,
            toggleSfx,
            pauseBgMusic,
            resumeBgMusic,
            playClickSound,
            playGameStartSound,
            initBgMusic
        }}>

            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
