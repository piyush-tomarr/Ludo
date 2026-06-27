import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaQuestionCircle, FaCheckCircle, FaMicrophone, FaDice, FaGift, FaCommentAlt, FaChessBoard, FaCoins, FaStar } from 'react-icons/fa';
import { GiChest, GiJeweledChalice, GiGoldBar } from 'react-icons/gi';
import classes from './DailyTasks.module.css';
import useTranslate from '../Util/ChangeLang';

const DailyTasks = () => {
    const navigate = useNavigate();
    const t = useTranslate();
    const [currentDay, setCurrentDay] = useState(3); // Example: user is on Day 3
    
    const weeklyRewards = [
        { day: 1, reward: '100', type: 'coins', claimed: true },
        { day: 2, reward: '200', type: 'coins', claimed: true },
        { day: 3, reward: '500', type: 'coins', claimed: false },
        { day: 4, reward: '1000', type: 'coins', claimed: false },
        { day: 5, reward: '2000', type: 'coins', claimed: false },
        { day: 6, reward: '5000', type: 'coins', claimed: false },
        { day: 7, reward: 'CHEST', type: 'chest', claimed: false, special: true },
    ];

    const [tasks, setTasks] = useState([
        { id: 1, title: t('Open Ludo Chat'), progress: 1, goal: 1, icon: <FaCommentAlt />, type: 'chat', color: '#3498db' },
        { id: 2, title: t('Win 500 Coins'), progress: 500, goal: 500, icon: <GiChest />, type: 'chest', color: '#f1c40f' },
        { id: 3, title: t('Play 1 Match'), progress: 0, goal: 1, icon: <FaChessBoard />, type: 'play', color: '#9b59b6' },
        { id: 4, title: t('Roll 6 two times'), progress: 0, goal: 2, icon: <FaDice />, type: 'dice', color: '#e67e22' },
        { id: 5, title: t('Send 1 Gift'), progress: 0, goal: 1, icon: <FaGift />, type: 'gift', color: '#e74c3c' }
    ]);

    const handleClaimDay = (day) => {
        if (day === currentDay) {
            console.log(`Claimed reward for Day ${day}`);
        }
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>
                <div className={classes.headerTitleContainer}>
                    <div className={classes.titleRibbon}>{t('DAILY MISSION')}</div>
                    <FaQuestionCircle className={classes.helpIcon} />
                </div>
                <button className={classes.backBtn} onClick={() => navigate('/menu')}>
                    <FaArrowLeft />
                </button>
            </div>

            <div className={classes.scrollArea}>
                {/* Weekly Streak Section */}
                <div className={classes.weeklySection}>
                    <div className={classes.sectionTitle}>
                        <h3>{t('WEEKLY REWARDS')}</h3>
                        <div className={classes.resetTimer}>{t('Resets in')} 12:30:45</div>
                    </div>
                    <div className={classes.daysGrid}>
                        {weeklyRewards.map((reward) => (
                            <div 
                                key={reward.day} 
                                className={`${classes.dayCard} ${reward.day === currentDay ? classes.currentDay : ''} ${reward.claimed ? classes.claimedDay : ''} ${reward.special ? classes.specialDay : ''}`}
                                onClick={() => handleClaimDay(reward.day)}
                            >
                                <div className={classes.dayLabel}>{t('Day')} {reward.day}</div>
                                <div className={classes.rewardIcon}>
                                    {reward.type === 'coins' ? <FaCoins /> : <GiChest />}
                                </div>
                                <div className={classes.rewardValue}>{reward.reward}</div>
                                {reward.claimed && <FaCheckCircle className={classes.checkIcon} />}
                                {reward.day === currentDay && !reward.claimed && (
                                    <div className={classes.claimBadge}>{t('CLAIM')}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tasks List Section */}
                <div className={classes.tasksSection}>
                    <div className={classes.sectionTitle}>
                        <h3>{t('DAILY TASKS')}</h3>
                    </div>
                    <div className={classes.taskList}>
                        {tasks.map(task => (
                            <div key={task.id} className={classes.taskCard}>
                                <div className={classes.taskIconContainer} style={{ background: task.color }}>
                                    <div className={classes.taskIconWrapper}>
                                        {task.icon}
                                    </div>
                                </div>

                                <div className={classes.taskInfo}>
                                    <h4 className={classes.taskTitle}>{task.title}</h4>
                                    <div className={classes.progressWrapper}>
                                        <div className={classes.progressBar}>
                                            <div 
                                                className={`${classes.progressFill} ${task.progress >= task.goal ? classes.completedFill : ''}`} 
                                                style={{ width: `${(task.progress / task.goal) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className={classes.progressText}>{task.progress}/{task.goal}</span>
                                    </div>
                                </div>

                                <div className={classes.rewardSection}>
                                    {/* <div className={classes.miniWheelContainer}>
                                        <div className={classes.miniWheel}>
                                            {[...Array(8)].map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={classes.wheelSegment} 
                                                    style={{ 
                                                        transform: `rotate(${i * 45}deg)`,
                                                        backgroundColor: i % 2 === 0 ? '#f1c40f' : '#e67e22'
                                                    }}
                                                ></div>
                                            ))}
                                            <div className={classes.wheelCenter}></div>
                                        </div>
                                        {task.progress >= task.goal && (
                                            <FaCheckCircle className={classes.completedCheck} />
                                        )}
                                    </div> */}
                                    <button 
                                        className={`${classes.claimBtnTask} ${task.progress >= task.goal ? classes.activeClaim : classes.inactiveClaim}`}
                                        disabled={task.progress < task.goal}
                                    >
                                        {task.progress >= task.goal ? t('CLAIM') : t('LOCKED')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={classes.footer}>
                {/* <button className={classes.spinAllBtn}>
                    <div className={classes.miniWheelIcon}></div>
                    SPIN ALL TASKS
                </button> */}
                <button className={classes.claimAllBtn}>
                    {t('CLAIM ALL REWARDS')}
                </button>
            </div>

        </div>
    );
};

export default DailyTasks;
