import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './MainMenu.module.css';
import logoImg from '../assets/ethio_ludo_logo.webp';

import spinWheel from '../assets/spinWheel.png';
import onlinePlayImg from '../assets/online_mode_icon.webp';
import worldwidePlayImg from '../assets/worldwide_mode_icon.webp';
import passNPlayImg from '../assets/local_mode_icon.webp';
import botPlayImg from '../assets/computer_mode_icon.webp';
import comingSoonImg from '../assets/coming_soon.webp';
import dabbingEmoji from '../assets/dabbing_emoji.webp';
import coinIcon from '../assets/gold_coin_icon.webp';

import { IoSettingsSharp, IoTrophy } from "react-icons/io5";
import { GiDiceSixFacesSix } from "react-icons/gi";
import {
    FaMusic, FaUser, FaShieldAlt, FaLock, FaComments, FaChevronRight,
    FaCrown, FaStar, FaPlus, FaGift, FaTimes, FaFacebook, FaGoogle,
    FaTrophy, FaThumbsUp, FaThumbsDown, FaEdit, FaCloudDownloadAlt,
    FaMobileAlt, FaArrowLeft, FaRegClipboard
} from 'react-icons/fa';
import SettingsMenu from '../Components/SettingsMenu';
import { useSound } from '../context/SoundContext';
import { fetchProfileFun } from '../Services/ApiFun';
import { useEffect } from 'react';
import { FcBriefcase, FcCalendar, FcRating, FcPortraitMode, FcRules, FcCurrencyExchange } from 'react-icons/fc';
import useTranslate from '../Util/ChangeLang';
import Emoji from '../Components/Emoji';
import { baseUrl1 } from '../Services/api';




const MainMenu = () => {
    const navigate = useNavigate();
    const t = useTranslate();
    const { isMusicMuted, toggleMusic } = useSound();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profileStats, setProfileStats] = useState(null);

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('ludo_user') || 'null');
        if (loggedUser) {
            setUser(loggedUser);
            fetchUserProfile(loggedUser.id);
        }
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const data = await fetchProfileFun(userId);
            if (data && data.user) {
                setProfileStats(data.user);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('ludo_user');
        localStorage.removeItem('ludo_token');
        setUser(null);
        setProfileStats(null);
        setIsProfileDropdownOpen(false);
        navigate('/auth');
    };

    // Derived or Placeholder data for the premium modal
    const userProfile = {
        name: user ? user.username : t("Guest Player"),
        level: profileStats ? Math.floor(profileStats.wins / 10) + 1 : 1,
        xp: profileStats ? (profileStats.wins % 10) * 100 + 50 : 0,
        maxXp: 1000,
        coins: profileStats ? profileStats.coins : (user ? user.coins || 0 : 0),
        gems: 0,
        avatar: user ? user.avatar : null,
        id: user ? user.id : t("Not Logged In"),
        totalGames: profileStats ? profileStats.total_games : 0,
        wins: profileStats ? profileStats.wins : 0,
        losses: profileStats ? profileStats.losses : 0,
        winStreak: profileStats ? (profileStats.win_streak || 0) : 0,
        performanceRating: profileStats ? (profileStats.total_games > 0 ? Math.round((profileStats.wins / profileStats.total_games) * 100) : 0) : 0,
    };

    const handleNavigate = (path) => {
        navigate(path);
    };



    return (
        <div className={classes.menuContainer}>
            {/* Top Navigation Bar */}
            <div className={classes.topNav}>
                <div className={classes.topLeftNav}>
                    <div className={classes.playerCard} onClick={() => setIsProfileDropdownOpen(true)}>
                        <div className={classes.playerAvatarWrapper}>
                            <div className={classes.playerAvatar}>
                                {userProfile.avatar ? <img  src={profileStats?.avatar ? `${baseUrl1}${profileStats.avatar}` : null} alt="Avatar" /> : <FaUser />}
                            </div>
                            <div className={classes.levelBadge}>
                                <FaStar className={classes.levelStar} />
                                <span className={classes.levelNum}>{userProfile.level}</span>
                            </div>
                        </div>
                        <div className={classes.playerInfo}>
                            <span className={classes.playerName}>{userProfile.name}</span>
                            <div className={classes.xpBarContainer}>
                                <div className={classes.xpBar}>
                                    <div className={classes.xpFill} style={{ width: `${(userProfile.xp / userProfile.maxXp) * 100}%` }}></div>
                                </div>
                                <span className={classes.xpText}>{userProfile.xp}/{userProfile.maxXp}</span>
                            </div>
                        </div>
                    </div>
                    <div className={classes.currencyPill}>
                        <div className={classes.currencyIconWrapper}>
                            <img src={coinIcon} alt="Coin" className={classes.pillCoinIcon} />
                        </div>
                        <span className={classes.currencyValue}>{userProfile.coins.toLocaleString()}</span>
                        <div className={classes.plusBtn} onClick={() => handleNavigate('/shop')}>+</div>
                    </div>
                </div>

                <div className={classes.topCenterNav}>
                    {/* Center nav content if any */}
                </div>

                <div className={classes.topRightNav}>
                    {/* <div className={classes.vipBtn}>
                        <div className={classes.vipIconWrapper}><FaCrown /></div>
                        <span>VIP</span>
                    </div>
                    <div className={classes.topActionIconBtn}>
                        <div className={classes.actionIconBox}><FcBriefcase /></div>
                        <span>FREE COINS</span>
                    </div>
                    <div className={classes.topActionIconBtn}>
                        <div className={classes.actionIconBox}><FaComments /></div>
                        <span>MESSAGES</span>
                    </div> */}

                    <div className={classes.topActionIconBtn} onClick={() => setIsSettingsOpen(true)}>
                        <div className={classes.actionIconBox}><IoSettingsSharp /></div>
                        <span>{t('SETTINGS')}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={classes.mainLayout}>

                <div className={classes.leftSidebar}>
                    <div className={classes.sidebarIconGroup}>
                        <div>
                            <button className={classes.sidebarIconBtn} onClick={() => setIsComingSoonOpen(true)}>
                                <FcCalendar className={classes.iconTxt} />
                                <span className={classes.sidebarLabel}>{t('DAILY TASKS')}</span>
                                <div className={classes.dotBadge}>!</div>
                            </button>
                        </div>



                        {/* <div>
                            <button className={classes.sidebarIconBtn} onClick={() => setIsComingSoonOpen(true)}>
                                <FcRating className={classes.iconTxt} />
                                <span className={classes.sidebarLabel}>{t('TOURNAMENTS')}</span>
                            </button>
                        </div> */}

                        {/* Dabbing Mascot Emoji moved from footer */}
                        <div className={classes.sidebarMascot}>
                            <img src={dabbingEmoji} alt="Dab" className={classes.sidebarEmoji} />
                        </div>

                        {/* <div>
                            <button className={classes.sidebarIconBtn}>
                                <FcBriefcase className={classes.iconTxt} />
                                <span className={classes.sidebarLabel}>CHEST ROOM</span>
                            </button>
                        </div> */}
                        {/* <div>
                            <button className={classes.sidebarIconBtn} onClick={() => handleNavigate('/lucky-7')}>
                                <GiDiceSixFacesSix className={classes.iconTxt} style={{ color: '#ff4757' }} />
                                <span className={classes.sidebarLabel}>LUCKY 7</span>
                            </button>
                        </div> */}
                        {/* <div>
                            <button className={classes.sidebarIconBtn}>
                                <FcCurrencyExchange className={classes.iconTxt} />
                                <span className={classes.sidebarLabel}>COIN EXCHANGE</span>
                            </button>
                        </div> */}
                    </div>
                </div>


                <div className={classes.centerContent}>
                    <div className={classes.logoArea}>
                        <div className={classes.logoGlow}></div>
                        <div className={classes.logoPlatform}></div>

                        {/* Main Logo Centered */}
                        <img src={logoImg} alt="Ethio Ludo" className={classes.mainLogo} />

                        {/* Right Side Column for Rewards & Spin */}
                        <div className={classes.desktopSideColumn}>
                            {/* Horizontal Weekly Gift Banner */}
                            <div className={classes.desktopRewardCard}>
                                <div className={classes.rewardBadgeIcon}><FaTrophy style={{ color: '#ffd32a' }} /></div>
                                <div className={classes.rewardBadgeText}>
                                    <h5>{t('WINNER ANNOUNCEMENT')}</h5>
                                    <p><span>Abel_Ludo</span> {t('just won')} <span>5,000</span> <Emoji id="coin" size="0.7rem" /></p>
                                </div>
                                <button className={classes.miniClaimBtn} onClick={() => handleNavigate('/leaderboard')}>
                                    {t('VIEW ALL')}
                                </button>
                            </div>

                            {/* Large Spinning Wheel */}
                            {/* <div className={classes.wheelContainer} onClick={() => handleNavigate('/spin-wheel')} style={{ cursor: 'pointer' }}>
                                <img src={spinWheel} alt="Spin" className={classes.rewardSpinWheel} />
                            </div> */}

                        </div>
                    </div>

                    {/* Modes Grid */}
                    <div className={classes.modesGrid}>
                        <div className={`${classes.modeCard} ${classes.modeGreen}`} onClick={() => handleNavigate('/online-mode')}>
                            <div className={classes.modeIconBox}>
                                <img src={onlinePlayImg} alt="Online" />
                            </div>
                            <h3>{t('PLAY ONLINE')}</h3>
                            <p>{t('Play with real players')}</p>
                        </div>
                        {/* <div className={`${classes.modeCard} ${classes.modeBlue}`} onClick={() => handleNavigate('/online/matchmaking')}>
                            <div className={classes.modeIconBox}>
                                <img src={worldwidePlayImg} alt="Worldwide" />
                            </div>
                            <h3>{t('PLAY WORLDWIDE')}</h3>
                            <p>{t('Play with players around the world')}</p>
                        </div> */}
                        <div className={`${classes.modeCard} ${classes.modeOrange}`} onClick={() => handleNavigate('/player-count')}>
                            <div className={classes.modeIconBox}>
                                <img src={passNPlayImg} alt="Pass N Play" />
                            </div>
                            <h3>{t('PASS N PLAY')}</h3>
                            <p>{t('Play with friends on the same device')}</p>
                        </div>
                        <div className={`${classes.modeCard} ${classes.modeRed}`} onClick={() => handleNavigate('/vs-computer')}>
                            <div className={classes.modeIconBox}>
                                <img src={botPlayImg} alt="Computer" />
                            </div>
                            <h3>{t('PLAY WITH COMPUTER')}</h3>
                            <p>{t('Play against AI opponent')}</p>
                        </div>
                    </div>

                    {/* Reward Section - Hidden on Desktop via CSS */}
                    <div className={classes.rewardSectionCard}>
                        <div className={classes.rewardCardInfo}>
                            <div className={classes.rewardChestIcon}>🎁</div>
                            <div className={classes.rewardTextWrapper}>
                                <h4>{t('COLLECT YOUR REWARD!')}</h4>
                                <button className={classes.claimBtn} onClick={() => handleNavigate('/redeem')}>
                                    <FcBriefcase /> {t('CLAIM NOW')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Wide Action Buttons (Responsive to Icons) */}
                <div className={classes.rightSidebar}>
                    <div className={classes.rightActionButtons}>
                        <button className={`${classes.wideActionBtn} ${classes.btnLeaderboard}`} onClick={() => handleNavigate('/leaderboard')}>
                            <div className={classes.wideBtnIcon}>
                                <div className={classes.rankBoxes}>
                                    <span className={classes.rankBox}>2</span>
                                    <span className={classes.rankBox} style={{ height: '35px', background: '#ffd700' }}>1</span>
                                    <span className={classes.rankBox} style={{ height: '20px' }}>3</span>
                                </div>
                                <IoTrophy className={classes.mobileOnlyIcon} style={{ color: '#ffd32a' }} />
                            </div>
                            <div className={classes.wideBtnContent}>
                                <h4>{t('LEADERBOARD')}</h4>
                                <p>{t('View top players')}</p>
                            </div>
                            <span className={classes.sidebarLabel}>{t('LEADERBOARD')}</span>
                            <FaChevronRight className={classes.wideBtnChevron} />
                        </button>

                        <button className={`${classes.wideActionBtn} ${classes.btnRedeem}`} onClick={() => handleNavigate('/redeem')}>
                            <div className={classes.wideBtnIcon}>
                                <div className={classes.profileIconBox}><FcCurrencyExchange /></div>
                                <FcCurrencyExchange className={classes.mobileOnlyIcon} />
                            </div>
                            <div className={classes.wideBtnContent}>
                                <h4>{t('REDEEM VAULT')}</h4>
                                <p>{t('Exchange your hard-earned ludo coins for real money')}</p>
                            </div>
                            <span className={classes.sidebarLabel}>{t('REDEEM VAULT')}</span>
                            <FaChevronRight className={classes.wideBtnChevron} />
                        </button>

                        <button className={`${classes.wideActionBtn} ${classes.btnMusic}`} onClick={toggleMusic}>
                            <div className={classes.wideBtnIcon}>
                                <div className={classes.musicIconBox}><FaMusic style={{ color: '#ff4757' }} /></div>
                                <FaMusic className={classes.mobileOnlyIcon} style={{ color: '#ff4757' }} />
                            </div>
                            <div className={classes.wideBtnContent}>
                                <h4>{t('MUSIC')}</h4>
                                <p>{t('Background music')}</p>
                            </div>
                            <span className={classes.sidebarLabel}>{t('MUSIC')}</span>
                            <div className={`${classes.statusToggle} ${!isMusicMuted ? classes.toggleActive : ''}`}>
                                <span className={classes.toggleText}>{isMusicMuted ? t('OFF') : t('ON')}</span>
                                <div className={classes.toggleThumb}></div>
                            </div>
                        </button>


                        {/* <button className={`${classes.wideActionBtn} ${classes.btnBot}`}>
                            <div className={classes.wideBtnIcon}>
                                <div className={classes.profileIconBox}><FcRules /></div>
                                <FcRules className={classes.mobileOnlyIcon} />
                            </div>
                            <div className={classes.wideBtnContent}>
                                <h4>BOT SYSTEM</h4>
                                <p>Configure AI behavior</p>
                            </div>
                            <span className={classes.sidebarLabel}>BOT SYSTEM</span>
                            <FaChevronRight className={classes.wideBtnChevron} />
                        </button> */}

                        {/* <button className={`${classes.wideActionBtn} ${classes.btnRedeem}`}>
                            <div className={classes.wideBtnIcon}>
                                <div className={classes.profileIconBox}><FcCurrencyExchange /></div>
                                <FcCurrencyExchange className={classes.mobileOnlyIcon} />
                            </div>
                            <div className={classes.wideBtnContent}>
                                <h4>REDEEM COINS</h4>
                                <p>Exchange coins for rewards</p>
                            </div>
                            <span className={classes.sidebarLabel}>REDEEM COINS</span>
                            <FaChevronRight className={classes.wideBtnChevron} />
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Bottom Status Bar / Footer */}
            <div className={classes.bottomStatusBar}>
                <div className={classes.statusItem}>
                    <div className={classes.statusIconWrapper}><FaShieldAlt className={classes.statusIcon} /></div>
                    <div className={classes.statusText}>
                        <span className={classes.statusTitle}>{t('SAFE & FAIR')}</span>
                        <span className={classes.statusSub}>{t('100% Secure Gameplay')}</span>
                    </div>
                </div>
                <div className={classes.statusDivider}></div>
                <div className={classes.statusItem}>
                    <div className={classes.statusIconWrapper}><FaLock className={classes.statusIcon} /></div>
                    <div className={classes.statusText}>
                        <span className={classes.statusTitle}>{t('PRIVATE TABLE')}</span>
                        <span className={classes.statusSub}>{t('Create & Play with Friends')}</span>
                    </div>
                </div>
                <div className={classes.statusDivider}></div>
                <button className={classes.statusItem} onClick={() => handleNavigate('/terms')}>
                    <div className={classes.statusIconWrapper}><FcRules className={classes.statusIcon} /></div>
                    <div className={classes.statusText}>
                        <span className={classes.statusTitle}>{t('TERMS & CONDITIONS')}</span>
                        <span className={classes.statusSub}>{t('Read our terms of service')}</span>
                    </div>
                </button>


                <div className={classes.statusDivider}></div>
                <div className={classes.statusItem}>
                    <div className={classes.statusIconWrapper}><FcCalendar className={classes.statusIcon} /></div>
                    <div className={classes.statusText}>
                        <span className={classes.statusTitle}>{t('DAILY REWARD')}</span>
                        <span className={classes.statusSub}>{t('Login daily & Win Rewards')}</span>
                    </div>
                </div>
            </div>

            <SettingsMenu
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {isProfileDropdownOpen && (
                <div className={classes.statsModalOverlay} onClick={() => setIsProfileDropdownOpen(false)}>
                    <div className={classes.statsModalContent} onClick={(e) => e.stopPropagation()}>

                        {/* Statistics Header Ribbon */}
                        <div className={classes.statsRibbonContainer}>
                            <div className={classes.statsRibbon}>{t('STATISTICS')}</div>
                        </div>

                        

                        <div className={classes.statsModalBody}>
                            {/* User ID & Country Header */}
                            <div className={classes.statsSubHeader}>
                                <div className={classes.flagBox}>🇪🇹</div>
                                <span className={classes.userIdText}>{userProfile.id}</span>
                                <button className={classes.copyBtn}><FaRegClipboard /></button>
                            </div>
                              
                            <button className={classes.statsBackBtn} onClick={() => setIsProfileDropdownOpen(false)}>
                                    <FaArrowLeft />
                                </button>  

                            {/* Profile Info Card */}
                            <div className={classes.profileStatsCard}>
                                <div className={classes.statsAvatarBox}>
                                    {userProfile.avatar ? <img  src={profileStats?.avatar ? `${baseUrl1}${profileStats.avatar}` : null} alt="Avatar" /> : <FaUser />}
                                </div>
                                <div className={classes.statsMainInfo}>
                                    <div className={classes.statsNameRow}>
                                        <div className={classes.genderIcon}><FaUser style={{ color: '#ff79c6' }} /></div>
                                        <span className={classes.statsNameText}>{userProfile.name}</span>
                                    </div>
                                    <div className={classes.statsCurrencyRow}>
                                        <div className={classes.statsCurrencyItem}>
                                            <div className={classes.statsCoinIcon}>
                                                <img src={coinIcon} alt="Coin" />
                                            </div>
                                            <span>{userProfile.coins.toLocaleString()}</span>
                                            <button className={classes.miniPlusBtn} onClick={() => handleNavigate('/shop')}>+</button>
                                        </div>
                                        <div className={classes.statsCurrencyItem} style={{ background: '#004b93' }}>
                                            <div className={classes.statsCoinIcon}>
                                                💎
                                            </div>
                                            <span>{userProfile.gems.toLocaleString()}</span>
                                            <button className={classes.miniPlusBtn} style={{ background: '#3498db' }} onClick={() => handleNavigate('/shop')}>+</button>
                                        </div>
                                    </div>
                                    <div >
                                         <button
                                    className={classes.editProfileBtn}
                                    onClick={() => user ? handleNavigate('/profile') : handleNavigate('/auth')}
                                >
                                    {user ? <><FaEdit /> {t('Edit Profile')}</> : t('Sign Up')}
                                </button>
                                    </div>
                                </div>
                            </div>

                            {/* Level Section */}
                            <div className={classes.statsLevelSection}>
                                <div className={classes.levelTitle}>{t('Level')} {userProfile.level}</div>
                                <div className={classes.levelProgressContainer}>
                                    <FaStar className={classes.levelProgressStar} />
                                    <div className={classes.levelProgressBar}>
                                        <div className={classes.levelProgressFill} style={{ width: `${(userProfile.xp / userProfile.maxXp) * 100}%` }}></div>
                                        <span className={classes.levelProgressText}>{userProfile.xp}/{userProfile.maxXp}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Statistics List */}
                            <div className={classes.statsListContainer}>
                                <div className={classes.statsListItem} style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                                    <div className={classes.statItemLeft} style={{ color: '#ffd700' }}>💰 {t('CREDIT BALANCE')}</div>
                                    <div className={classes.statItemRight} style={{ color: '#ffd700', fontWeight: '900' }}>{userProfile.coins.toLocaleString()} <Emoji id="coin" size="1.2rem" /></div>
                                </div>
                                <div className={classes.statsListItem}>
                                    <div className={classes.statItemLeft}><FaThumbsUp /> {t('GAMES WON')}</div>
                                    <div className={classes.statItemRight}>{userProfile.wins}</div>
                                </div>
                                <div className={classes.statsListItem}>
                                    <div className={classes.statItemLeft}><FaThumbsDown /> {t('GAMES LOST')}</div>
                                    <div className={classes.statItemRight}>{userProfile.losses}</div>
                                </div>
                                <div className={classes.statsListItem}>
                                    <div className={classes.statItemLeft}><FaTrophy /> {t('WIN STREAK')}</div>
                                    <div className={classes.statItemRight}>{userProfile.winStreak}</div>
                                </div>
                                <div className={classes.statsListItem}>
                                    <div className={classes.statItemLeft}>🎖 {t('PERFORMANCE RATING')}</div>
                                    <div className={classes.statItemRight}>{userProfile.performanceRating}%</div>
                                </div>
                                <div className={classes.statsListItem}>
                                    <div className={classes.statItemLeft}>👑 {t('TOURNAMENTS WON')}</div>
                                    <div className={classes.statItemRight}>0</div>
                                </div>
                            </div>

                            {/* Action Buttons - Only show if user is logged in */}
                            {user && (
                                <div className={classes.statsActionButtons}>
                                    <button className={classes.statsActionBtn} style={{ background: 'linear-gradient(to bottom, #f1c40f, #f39c12)', color: '#000', width: '100%', margin: '0' }} onClick={() => handleNavigate('/shop')}>
                                        💰 {t('Buy Coins')}
                                    </button>
                                </div>
                            )}


                            {/* Footer Buttons */}
                            <div className={classes.statsModalFooter}>
                                {/* <button
                                    className={classes.editProfileBtn}
                                    onClick={() => user ? handleNavigate('/profile') : handleNavigate('/auth')}
                                >
                                    {user ? <><FaEdit /> {t('Edit Profile')}</> : t('Sign Up')}
                                </button> */}
                                {/* <button className={classes.statsBackBtn} onClick={() => setIsProfileDropdownOpen(false)}>
                                    <FaArrowLeft />
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isComingSoonOpen && (
                <div className={classes.comingSoonOverlay} onClick={() => setIsComingSoonOpen(false)}>
                    <div className={classes.comingSoonModal} onClick={(e) => e.stopPropagation()}>
                        <div className={classes.comingSoonHeader}>
                            <div className={classes.comingSoonRibbon}>{t('TOURNAMENTS')}</div>
                            <button className={classes.comingSoonClose} onClick={() => setIsComingSoonOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className={classes.comingSoonBody}>
                            <img src={comingSoonImg} alt="Coming Soon" className={classes.comingSoonMascot} />
                            <div className={classes.comingSoonGlow}></div>
                        </div>
                        <div className={classes.comingSoonFooter}>
                            <button className={classes.comingSoonBtn} onClick={() => setIsComingSoonOpen(false)}>
                                {t('OK')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default MainMenu;
