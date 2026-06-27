import React from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './CoinShop.module.css';
import coinIcon from '../assets/gold_coin_icon.webp';
import { FaArrowLeft, FaGem, FaShoppingCart } from 'react-icons/fa';
import useTranslate from '../Util/ChangeLang';

const CoinShop = () => {
    const navigate = useNavigate();
    const t = useTranslate();

    const coinPackages = [
        { id: 1, amount: 150, price: 1.99, icon: coinIcon },
        { id: 2, amount: 250, price: 2.99, icon: coinIcon },
        { id: 3, amount: 450, price: 3.99, icon: coinIcon },
        { id: 4, amount: 1200, price: 4.99, icon: coinIcon },
        { id: 5, amount: 2000, price: 5.99, icon: coinIcon },
        { id: 6, amount: 5000, price: 9.99, icon: coinIcon, featured: true },
    ];

    const handleBuy = (pkg) => {
        alert(`Redirecting to payment for ${pkg.amount} coins (${t('ETB')}${pkg.price})...`);
    };

    return (
        <div className={classes.shopContainer}>
            <div className={classes.shopHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/menu')}>
                    <FaArrowLeft />
                </button>
                <h1 className={classes.shopTitle}>
                    <FaShoppingCart className={classes.titleIcon} /> {t('COIN SHOP')}
                </h1>
                <div className={classes.dummySpacer}></div>
            </div>

            <div className={classes.shopContent}>
                <div className={classes.shopBoard}>
                    <div className={classes.boardHeader}>
                        <h2>{t('SELECT PACKAGE')}</h2>
                        <p>{t('Get coins to play more and win big!')}</p>
                    </div>

                    <div className={classes.packageList}>
                        {coinPackages.map((pkg) => (
                            <div key={pkg.id} className={`${classes.packageRow} ${pkg.featured ? classes.featuredRow : ''}`}>
                                <div className={classes.coinDisplay}>
                                    <img src={pkg.icon} alt="Coins" className={classes.coinImg} />
                                    <span className={classes.coinAmount}>{pkg.amount.toLocaleString()}</span>
                                </div>
                                
                                <div className={classes.priceDisplay}>
                                    <span className={classes.priceTag}>{t('ETB')} {pkg.price} </span>
                                </div>

                                <button className={classes.buyBtn} onClick={() => handleBuy(pkg)}>
                                    {t('BUY')}
                                </button>
                                
                                {pkg.featured && <div className={classes.bestValueBadge}>{t('BEST VALUE')}</div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={classes.shopFooter}>
                    <div className={classes.securePayment}>
                        <span>🔒 {t('Secure Payment Methods')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoinShop;
