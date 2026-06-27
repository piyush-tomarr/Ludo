import React from 'react';
import styles from './Dice.module.css';

const dotPositions = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 3, 6, 2, 5, 8],
};

const Face = ({ value, className, playerColor }) => {
  const dots = dotPositions[value] || [];
  return (
    <div
      className={`${styles.face} ${styles[className]}`}
      style={{ '--current-color': playerColor }}
    >
      <div className={styles.diceFace}>
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${dots.includes(i) ? styles.visible : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

const Dice = ({ value, color, isActive, isRolling, onRoll, size, isVisible }) => {
  // 🎲 Remember last value to avoid "flash of 1" when dice state is reset to null
  const lastValue = React.useRef(1);
  React.useEffect(() => {
    if (value !== null && value !== undefined) {
      lastValue.current = value;
    }
  }, [value]);

  const displayValue = value || lastValue.current;
  const showClass = styles[`show-${displayValue}`];

  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = () => {
    if (isActive && !isClicked) {
      setIsClicked(true);
      onRoll();
      // Auto-reset local click lock after 500ms (by then parent state should have updated)
      setTimeout(() => setIsClicked(false), 500);
    }
  };

  return (
    <div
      className={`${styles.diceContainer} ${isActive && !isClicked ? styles.active : ''}`}
      onClick={handleClick}
      style={{
        '--player-color': color,
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
        opacity: isVisible ? 1 : 0,
        pointerEvents: (isVisible && !isClicked) ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}
    >
      <div className={`${styles.cube} ${isRolling ? styles.rolling : showClass}`}>
        <Face value={1} className="front" playerColor={color} />
        <Face value={3} className="back" playerColor={color} />
        <Face value={2} className="right" playerColor={color} />
        <Face value={4} className="left" playerColor={color} />
        <Face value={5} className="top" playerColor={color} />
        <Face value={6} className="bottom" playerColor={color} />
      </div>
    </div>
  );
};

export default Dice;
