import { MAIN_PATH } from "../Data/path";
/* ðŸ‘¨â€ðŸŽ¨ Helper to ensure yellow consistency */
const normalizeColor = (color) => {
  if (!color) return color;
  const lower = color.trim().toLowerCase();
  if (lower === "#fad416") return "#fad416";
  return lower;
};

/* ===== Colored lane entry points ===== */
const HOME_TURN_START = {
  "#fad416": { x: 14, y: 7 },
  "#2196f3": { x: 7, y: 14 },
  "#f44336": { x: 0, y: 7 },
  "#4caf50": { x: 7, y: 0 }
};

/* ===== Lane directions ===== */
const LANE_DIRECTION = {
  "#fad416": { dx: -1, dy: 0 },
  "#2196f3": { dx: 0, dy: -1 },
  "#f44336": { dx: 1, dy: 0 },
  "#4caf50": { dx: 0, dy: 1 }
};

import pawnClasses from './Pawn.module.css';

export const MovingPawn = ({
  pawn,
  stackIndex = 0,
  stackCount = 1,
  isActive = false,
  onMove
}) => {
  if (!pawn || !pawn.color) return null;
  if (pawn.pathIndex === -1 && pawn.homeIndex === -1) return null;

  const normColor = normalizeColor(pawn.color);
  let x = 0;
  let y = 0;

  /* ===== POSITION ===== */

  if (pawn.homeIndex !== -1) {
    if (pawn.homeIndex === 5) {
      // ðŸ FINISHED: Position in center triangles
      const center_base = 7.5;
      const dist = 0.90;
      const TRI_CENTERS = {
        "#f44336": { cx: center_base - dist, cy: center_base }, // Left (Red)
        "#4caf50": { cx: center_base, cy: center_base - dist }, // Top (Green)
        "#fad416": { cx: center_base + dist, cy: center_base }, // Right (Yellow)
        "#2196f3": { cx: center_base, cy: center_base + dist }  // Bottom (Blue)
      };

      const base = TRI_CENTERS[normColor];
      if (!base) return null; // Safety guard

      const scatter = 0.22;
      const finishedOffsets = [
        { dx: -scatter, dy: -scatter },
        { dx: scatter, dy: -scatter },
        { dx: -scatter, dy: scatter },
        { dx: scatter, dy: scatter }
      ];

      const si = stackIndex < 0 ? 0 : stackIndex;
      const off = finishedOffsets[si % 4];
      x = base.cx + off.dx - 0.5;
      y = base.cy + off.dy - 0.5;
    } else {
      const start = HOME_TURN_START[normColor];
      const dir = LANE_DIRECTION[normColor];
      if (!start || !dir) return null; // Safety guard

      x = start.x + dir.dx * (pawn.homeIndex + 1);
      y = start.y + dir.dy * (pawn.homeIndex + 1);
    }
  } else {
    const cell = MAIN_PATH[pawn.pathIndex];
    if (!cell) return null;
    x = cell.x;
    y = cell.y;
  }

  /* ===== STACK OFFSET (CIRCULAR - LUDO KING STYLE) ===== */

  const getStackOffset = (index, count, isActive) => {
    if (count <= 1) return { dx: 0, dy: 0 };

    // Increase radius as count increases to keep them visible ("shown outer")
    // Active pawns get a little extra "push" to stay on top/outer
    const baseRadius = count > 4 ? 0.33 : 0.28;
    const radius = isActive ? baseRadius + 0.08 : baseRadius;

    // Circular arrangement
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2;

    return {
      dx: Math.cos(angle) * (radius),
      dy: Math.sin(angle) * (radius)
    };
  };

  let offset = { dx: 0, dy: 0 };
  if (pawn.homeIndex !== 5) {
    offset = getStackOffset(stackIndex, stackCount, isActive);
  }

  /* ===== SIZE CONTROL ===== */

  // Shrink more as count increases to avoid too much overlap
  const baseSize = stackCount > 4 ? 0.20 : (stackCount > 1 ? 0.26 : 0.32);
  const activeScale = 1;

  const cx = x + 0.5 + offset.dx;
  const cy = y + 0.5 + offset.dy;

  const isFinished = pawn.homeIndex === 5;

  return (
    <g
      onClick={() => isActive && onMove(pawn.id)}
      className={`${(isActive && !isFinished) ? pawnClasses.activePawn : ""} ${isFinished ? pawnClasses.finishedPawn : ""}`}
      style={{
        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: isActive ? 'pointer' : 'default',
        color: pawn.color // for currentColor in CSS
      }}
    >
      {/* 1. Underlying Glow (Active Only) */}
      {isActive && !isFinished && (
        <circle
          cx={cx}
          cy={cy}
          r={baseSize * 1.5}
          fill={pawn.color}
          className={pawnClasses.pawnGlow}
          opacity={0.25}
        />
      )}

      {/* 2. Dynamic Shadow (Under pawn) */}
      {!isFinished && (
        <circle
          cx={cx}
          cy={cy + 0.12}
          r={isActive ? baseSize + 0.15 : baseSize + 0.05}
          fill="rgba(0,0,0,0.4)"
          filter="url(#pawnShadow)"
          style={{ transition: 'all 0.2s ease' }}
        />
      )}

      {/* 3. 3D BASE DISK (The 'feet' of the pawn) */}
      <circle cx={cx} cy={cy + (baseSize * 0.15)} r={baseSize + 0.08} fill="rgba(0,0,0,0.3)" />
      <circle cx={cx} cy={cy + (baseSize * 0.1)} r={baseSize + 0.08} fill="#eee" />
      <circle cx={cx} cy={cy + (baseSize * 0.1)} r={baseSize + 0.08} fill={pawn.color} opacity={0.4} />

      {/* 4. RIM (Outer edge of the main body) */}
      <circle cx={cx} cy={cy} r={baseSize + 0.05} fill="#fff" opacity={1} />

      {/* 5. MAIN BODY (With Gradient) */}
      <circle
        cx={cx}
        cy={cy}
        r={baseSize}
        fill={`url(#${normColor === "#f44336" ? "gradRed" : normColor === "#4caf50" ? "gradGreen" : normColor === "#2196f3" ? "gradBlue" : "gradYellow"})`}
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={0.02}
        className={pawnClasses.pawnBase}
      />

      {/* 6. INNER BEZEL (Adds depth to the top surface) */}
      <circle cx={cx} cy={cy} r={baseSize - 0.04} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.04" />

      {/* 7. STAR ICON (Central & Rotating) */}
      <path
        className={pawnClasses.starIcon}
        d={`
          M ${cx} ${cy - (baseSize * 0.55)} 
          L ${cx + (baseSize * 0.15)} ${cy - (baseSize * 0.15)} 
          L ${cx + (baseSize * 0.55)} ${cy - (baseSize * 0.15)} 
          L ${cx + (baseSize * 0.22)} ${cy + (baseSize * 0.12)} 
          L ${cx + (baseSize * 0.35)} ${cy + (baseSize * 0.5)} 
          L ${cx} ${cy + (baseSize * 0.28)} 
          L ${cx - (baseSize * 0.35)} ${cy + (baseSize * 0.5)} 
          L ${cx - (baseSize * 0.22)} ${cy + (baseSize * 0.12)} 
          L ${cx - (baseSize * 0.55)} ${cy - (baseSize * 0.15)} 
          L ${cx - (baseSize * 0.15)} ${cy - (baseSize * 0.15)} 
          Z
        `}
        fill="#fff"
        opacity="0.95"
      />

      {/* 8. TOP GLOSS (Premium highlight) */}
      <ellipse 
        cx={cx - (baseSize * 0.35)} 
        cy={cy - (baseSize * 0.35)} 
        rx={baseSize * 0.25} 
        ry={baseSize * 0.15} 
        fill="rgba(255,255,255,0.5)" 
        transform={`rotate(-45 ${cx - (baseSize * 0.35)} ${cy - (baseSize * 0.35)})`} 
      />
    </g>
  );
  
};
