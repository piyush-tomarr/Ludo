import { useState, useEffect, useRef } from 'react';
import classes from './Chat.module.css';
import { IoCloseOutline, IoSend } from "react-icons/io5";

const Chat = ({ isOpen, onClose, onSendSticker, localPlayerName, localPlayerColor }) => {
    const [activeTab, setActiveTab] = useState('stickers'); // 'messages' or 'stickers'
    
    // High-fidelity expressive emojis/stickers
    const stickers = [
        '😂', '❤️', '🔥', '😭', 
        '😮', '🤔', '👏', '🎮', 
        '🎲', '🏆', '😡', '😎',
        '👍', '💪', '🙏', '🤐'
    ];

    if (!isOpen) return null;

    return (
        <div className={classes.overlay} onClick={onClose}>
            <div className={classes.modal} onClick={e => e.stopPropagation()}>
                {/* Header Section */}
                <div className={classes.header}>
                    <div className={classes.titleGroup}>
                        <h3 className={classes.title}>Ludo Chat</h3>
                        <p className={classes.subtitle}>Keep chats friendly and civil</p>
                    </div>
                    <button className={classes.closeBtn} onClick={onClose}>
                        <IoCloseOutline />
                    </button>
                </div>

                {/* Tabs Section */}
                <div className={classes.body}>
                    <div className={classes.tabContainer}>
                        <button 
                            className={`${classes.tabItem} ${activeTab === 'messages' ? classes.tabActive : ''}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            Messages
                        </button>
                        <button 
                            className={`${classes.tabItem} ${activeTab === 'stickers' ? classes.tabActive : ''}`}
                            onClick={() => setActiveTab('stickers')}
                        >
                            Stickers
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className={classes.contentArea}>
                        {activeTab === 'messages' ? (
                            <div className={classes.emptyMessages}>
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            <div className={classes.stickerGrid}>
                                {stickers.map((emoji, index) => (
                                    <button 
                                        key={index} 
                                        className={classes.stickerItem}
                                        onClick={() => {
                                            onSendSticker(emoji);
                                            onClose(); // Close after sending a sticker as requested "user can only send emojis"
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className={classes.footer}>
                    <div className={classes.inputWrapper}>
                        <div className={classes.chatIcon}>💬</div>
                        <input 
                            type="text" 
                            placeholder="Enter text..." 
                            className={classes.chatInput}
                            disabled={true} // User said "user can only send emojis"
                        />
                        <button className={classes.sendBtn} disabled={true}>
                            <div className={classes.sendBtnLabel}>Send</div>
                            <div className={classes.charCount}>0/70</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
