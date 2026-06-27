import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./RedeemVault.module.css";
import { fetchProfileFun, redeemCoinsFun, fetchRedeemHistoryFun } from "../Services/ApiFun";
import useTranslate from "../Util/ChangeLang";
import Emoji from "../Components/Emoji";
import { IoArrowBack, IoSettings } from "react-icons/io5";
import SettingsMenu from "../Components/SettingsMenu";
import { toast } from "react-toastify";

const RedeemVault = () => {
    const navigate = useNavigate();
    const t = useTranslate();
    const [userStats, setUserStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastRedeemed, setLastRedeemed] = useState({ coins: 0, usd: 0 });
    const [selectedOption, setSelectedOption] = useState(1); // Default to center (5000 coins)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
            if (!loggedUser || !loggedUser.id) {
                navigate("/auth");
                return;
            }

            try {
                const [profileRes, historyRes] = await Promise.all([
                    fetchProfileFun(loggedUser.id),
                    fetchRedeemHistoryFun(loggedUser.id)
                ]);
                setUserStats(profileRes.user);
                setHistory(historyRes.history || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    const handleRedeem = async (coinsToDeduct, usdAmount) => {
        if (!userStats || userStats.coins < coinsToDeduct) {
            // alert(t('Insufficient Coins! Keep playing to earn more.'));
            toast.error(t('Insufficient Coins! Keep playing to earn more.'))
            return;
        }

        setIsRedeeming(true);
        try {
            await redeemCoinsFun(userStats.id, coinsToDeduct, usdAmount);
            setUserStats(prev => ({ ...prev, coins: prev.coins - coinsToDeduct }));
            setLastRedeemed({ coins: coinsToDeduct, usd: usdAmount });
            setShowSuccessModal(true);
            
            const historyRes = await fetchRedeemHistoryFun(userStats.id);
            setHistory(historyRes.history || []);
        } catch (err) {
            // alert(t('Redemption failed. Please try again.'));
            toast.error(t('Redemption failed. Please try again.'))
            console.error(err);
        } finally {
            setIsRedeeming(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    if (isLoading) {
        return <div className={classes.container}><div className={classes.loading}>{t('Loading...')}</div></div>;
    }

    const redeemOptions = [
        { coins: 1500, usd: 2 },
        { coins: 5000, usd: 4, featured: true },
        { coins: 10000, usd: 8 }
    ];

    return (
        <div className={classes.container}>
            <button className={classes.backButton} onClick={() => navigate(-1)}>
                <IoArrowBack />
            </button>

            <header className={classes.header}>
                <h1 className={classes.title}>{t('REDEEM VAULT')}</h1>
                <p className={classes.subtitle}>{t('Exchange your hard-earned Ludo Coins for Real Money')}</p>
            </header>

            <div className={classes.balancePill}>
                <div className={classes.balanceInfo}>
                    <span className={classes.coinIcon}><Emoji id="coin" size="1.2rem" /></span>
                    <span className={classes.coinAmount}>{userStats?.coins?.toLocaleString() || 0}</span>
                </div>
                <div className={classes.balanceLabel}>{t('COINS AVAILABLE')}</div>
            </div>

            <div className={classes.cardsContainer}>
                {redeemOptions.map((option, idx) => {
                    // const isDisabled = (userStats?.coins || 0) < option.coins;
                    const isDisabled = false;
                    return (
                        <div 
                            key={idx} 
                            className={`${classes.card} ${selectedOption === idx ? classes.cardFeatured : ""} ${isDisabled ? classes.cardDisabled : ""}`}
                            onClick={() => !isDisabled && setSelectedOption(idx)}
                        >
                            <div className={classes.cardCoinInfo}>
                                <span className={classes.coinIcon}><Emoji id="coin" size="1.5rem" /></span>
                                <span className={classes.cardCoinValue}>{option.coins.toLocaleString()}</span>
                            </div>
                            <span className={classes.cardLabel}>{t('COINS')}</span>
                            <div className={classes.cardArrow}>↓</div>
                            <div className={classes.cardMoneyValue}>{t('ETB')} {option.usd}</div>
                            <button 
                                className={classes.redeemBtn} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRedeem(option.coins, option.usd);
                                }}
                                disabled={isDisabled || isRedeeming}
                            >
                                {isRedeeming ? t('Processing...') : t('REDEEM NOW')}
                            </button>
                        </div>
                    );
                })}
            </div>

            <section className={classes.historySection}>
                <div className={classes.historyHeader}>
                    <span className={classes.historyIcon}><Emoji id="clipboard" size="1.5rem" /></span>
                    <h2 className={classes.historyTitle}>{t('REDEMPTION HISTORY')}</h2>
                </div>
                <div className={classes.divider}></div>

                <div className={classes.tableContainer}>
                    {history.length > 0 ? (
                        <table className={classes.historyTable}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{t('COINS SPENT')}</th>
                                    <th>{t('ETB')} {t('AMOUNT')}</th>
                                    <th>{t('STATUS')}</th>
                                    <th>{t('DATE & TIME')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((row, index) => (
                                    <tr key={row.id || index}>
                                        <td className={classes.indexCol}>{index + 1}</td>
                                        <td>
                                            <div className={classes.coinCol}>
                                                <span><Emoji id="coin" /></span>
                                                <span>{row.coins?.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className={classes.moneyCol}>{t('ETB')}{Number(row.usd || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`${classes.statusBadge} ${classes[row.status?.toLowerCase()]}`}>
                                                <span>
                                                    {row.status?.toLowerCase() === 'pending' ? <Emoji id="hourglass_flowing_sand" /> : 
                                                     row.status?.toLowerCase() === 'approved' ? <Emoji id="white_check_mark" /> : <Emoji id="x" />}
                                                </span>
                                                {t(row.status?.toUpperCase() || 'PENDING')}
                                            </span>
                                        </td>
                                        <td>{formatDate(row.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={classes.noHistory}>{t('No redemption history found.')}</div>
                    )}
                </div>
            </section>

            <button className={classes.settingsBtn} onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                <IoSettings />
            </button>

            {isRedeeming && (
                <div className={classes.overlay}>
                    <div className={classes.loading}>{t('Processing...') || 'Redeeming...'}</div>
                </div>
            )}

            {showSuccessModal && (
                <div className={classes.overlay}>
                    <div className={classes.successModal}>
                        <div className={classes.successIcon}><Emoji id="tada" size="3rem" /></div>
                        <h2 className={classes.successTitle}>{t('Request Submitted!')}</h2>
                        <p className={classes.successText}>
                            {t('Your request to redeem')} ${lastRedeemed.usd} {t('for')} {lastRedeemed.coins.toLocaleString()} {t('coins has been submitted and is pending review.')}
                        </p>
                        <button className={classes.closeBtn} onClick={() => setShowSuccessModal(false)}>
                            {t('CLOSE')}
                        </button>
                    </div>
                </div>
            )}

           <div>
             <SettingsMenu 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
           </div>


           {/* <SettingsMenu 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            /> */}
        </div>
    );
};

export default RedeemVault;
