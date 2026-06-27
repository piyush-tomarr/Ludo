import { MAIN_PATH } from "../Data/path";

export const Pawn = ({ pawn, movePawn }) => {
  if (pawn.pathIndex === -1) return null;

  const { x, y } = MAIN_PATH[pawn.pathIndex];
  const cx = x + 0.5;
  const cy = y + 0.5;

  return (
    <g
      onClick={() => movePawn(pawn.id)}
      style={{ cursor: "pointer" }}
    >
      {/* Soft shadow */}
      <ellipse
        cx={cx + 0.10}
        cy={cy + 0.12}
        rx={0.36}
        ry={0.32}
        fill="rgba(0,0,0,0.25)"
      />

      {/* White outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={0.40}
        fill="#ffffff"
      />

      {/* Main colored shell */}
      <circle
        cx={cx}
        cy={cy}
        r={0.34}
        fill={pawn.color}
      />

      {/* Bottom depth */}
      <circle
        cx={cx}
        cy={cy + 0.05}
        r={0.30}
        fill="rgba(0,0,0,0.18)"
      />

      {/* Inner bright core */}
      <circle
        cx={cx}
        cy={cy - 0.03}
        r={0.26}
        fill={pawn.color}
      />

      {/* Gloss highlight */}
      <ellipse
        cx={cx - 0.12}
        cy={cy - 0.16}
        rx={0.11}
        ry={0.08}
        fill="rgba(255,255,255,0.9)"
      />

      {/* Small shine dot */}
      <circle
        cx={cx - 0.17}
        cy={cy - 0.20}
        r={0.04}
        fill="rgba(255,255,255,0.9)"
      />
    </g>
  );
};
