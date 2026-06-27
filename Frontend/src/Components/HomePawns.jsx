import pawnClasses from './Pawn.module.css';

export const HomePawns = ({ pawns, baseX, baseY, color, onPawnClick, isActive = false, isHidden = false }) => {
  const positions = [
    { x: baseX + 0.75, y: baseY + 0.75 },
    { x: baseX + 2.25, y: baseY + 0.75 },
    { x: baseX + 0.75, y: baseY + 2.25 },
    { x: baseX + 2.25, y: baseY + 2.25 },
  ];

  return (
    <>
      {positions.map((pos, index) => {
        const pawn = pawns[index];
        const isCurrentlyInBase = pawn && pawn.pathIndex === -1 && pawn.homeIndex === -1 && !pawn.isFinished;

        const cx = pos.x;
        const cy = pos.y;

        return (
          <g key={`base-slot-${index}`}>
            {/* âšª PERMANENT BACKGROUND DOT (Always visible) */}
            <circle
              cx={cx}
              cy={cy}
              r={0.42}
              fill={color}
              opacity={0.3}
            />

            {/* 🟢 REAL PAWN (Rendered only if in base) */}
            {isCurrentlyInBase && (
              <g
                onClick={() => onPawnClick(pawn.id)}
                className={isActive ? pawnClasses.activePawn : ""}
                style={{
                  cursor: 'pointer',
                  transition: "all 0.3s ease",
                  color: color
                }}
              >
                {/* 1. Underlying Glow (Active Only) */}
                {isActive && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={0.52}
                    fill={color}
                    className={pawnClasses.pawnGlow}
                    opacity={0.25}
                  />
                )}

                {/* 2. Dynamic Shadow */}
                <circle
                  cx={cx}
                  cy={cy + 0.08}
                  r={isActive ? 0.48 : 0.4}
                  fill="rgba(0,0,0,0.4)"
                  filter="url(#pawnShadow)"
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* 3. 3D BASE DISK */}
                <circle cx={cx} cy={cy + 0.06} r={0.46} fill="rgba(0,0,0,0.3)" />
                <circle cx={cx} cy={cy + 0.04} r={0.46} fill="#eee" />
                <circle cx={cx} cy={cy + 0.04} r={0.46} fill={color} opacity={0.4} />

                {/* 4. White outer rim */}
                <circle cx={cx} cy={cy} r={0.42} fill="#fff" />

                {/* 5. Main body with gradient */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={0.38} 
                  fill={`url(#${color === "#f44336" ? "gradRed" : color === "#4caf50" ? "gradGreen" : color === "#2196f3" ? "gradBlue" : "gradYellow"})`} 
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth={0.02}
                  className={pawnClasses.pawnBase}
                />

                {/* 6. Inner ring highlight */}
                <circle cx={cx} cy={cy} r={0.32} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.04" />

                {/* 7. STAR ICON (Rotating) */}
                <path
                  className={pawnClasses.starIcon}
                  d={`
                    M ${cx} ${cy - 0.22} 
                    L ${cx + 0.06} ${cy - 0.06} 
                    L ${cx + 0.22} ${cy - 0.06} 
                    L ${cx + 0.09} ${cy + 0.05} 
                    L ${cx + 0.14} ${cy + 0.2} 
                    L ${cx} ${cy + 0.11} 
                    L ${cx - 0.14} ${cy + 0.2} 
                    L ${cx - 0.09} ${cy + 0.05} 
                    L ${cx - 0.22} ${cy - 0.06} 
                    L ${cx - 0.06} ${cy - 0.06} 
                    Z
                  `}
                  fill="#fff"
                  opacity="0.95"
                />

                {/* 8. Top Gloss */}
                <ellipse 
                  cx={cx - 0.14} 
                  cy={cy - 0.14} 
                  rx={0.12} 
                  ry={0.08} 
                  fill="rgba(255,255,255,0.5)" 
                  transform={`rotate(-45 ${cx - 0.14} ${cy - 0.14})`} 
                />
              </g>
            )}
          </g>
        );
      })}
    </>
  );
};
