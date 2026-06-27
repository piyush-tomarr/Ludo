// import { Stage, Layer, Rect, Line } from "react-konva";
// import Token from "./Token";

// const SIZE = 450;
// const CELL = SIZE / 15;



// const centerX = CELL * 6;
// const centerY = CELL * 6;
// const centerSize = CELL * 3;

// const midX = centerX + centerSize / 2;
// const midY = centerY + centerSize / 2;


// const BoardCanvas = () => {
//   return (
//     <Stage width={SIZE} height={SIZE}>
//       <Layer>

//         {/* BACKGROUND */}
//         <Rect width={SIZE} height={SIZE} fill="#ffffff" />

//         {/* ================= RED HOME ================= */}
//         <Rect x={0} y={0} width={CELL * 6} height={CELL * 6} fill="#ffcdd2" />
//         <Rect x={CELL} y={CELL} width={CELL * 4} height={CELL * 4} fill="#ffffff" />

//         <Token x={CELL * 2} y={CELL * 2} color="red" />
//         <Token x={CELL * 4} y={CELL * 2} color="red" />
//         <Token x={CELL * 2} y={CELL * 4} color="red" />
//         <Token x={CELL * 4} y={CELL * 4} color="red" />

//         {/* ================= BLUE HOME ================= */}
//         <Rect x={CELL * 9} y={0} width={CELL * 6} height={CELL * 6} fill="#bbdefb" />
//         <Rect x={CELL * 10} y={CELL} width={CELL * 4} height={CELL * 4} fill="#ffffff" />

//         <Token x={CELL * 11} y={CELL * 2} color="blue" />
//         <Token x={CELL * 13} y={CELL * 2} color="blue" />
//         <Token x={CELL * 11} y={CELL * 4} color="blue" />
//         <Token x={CELL * 13} y={CELL * 4} color="blue" />

//         {/* ================= GREEN HOME ================= */}
//         <Rect x={0} y={CELL * 9} width={CELL * 6} height={CELL * 6} fill="#c8e6c9" />
//         <Rect x={CELL} y={CELL * 10} width={CELL * 4} height={CELL * 4} fill="#ffffff" />

//         <Token x={CELL * 2} y={CELL * 11} color="green" />
//         <Token x={CELL * 4} y={CELL * 11} color="green" />
//         <Token x={CELL * 2} y={CELL * 13} color="green" />
//         <Token x={CELL * 4} y={CELL * 13} color="green" />

//         {/* ================= YELLOW HOME ================= */}
//         <Rect x={CELL * 9} y={CELL * 9} width={CELL * 6} height={CELL * 6} fill="#fff9c4" />
//         <Rect x={CELL * 10} y={CELL * 10} width={CELL * 4} height={CELL * 4} fill="#ffffff" />

//         <Token x={CELL * 11} y={CELL * 11} color="yellow" />
//         <Token x={CELL * 13} y={CELL * 11} color="yellow" />
//         <Token x={CELL * 11} y={CELL * 13} color="yellow" />
//         <Token x={CELL * 13} y={CELL * 13} color="yellow" />

//         {/* ================= CENTER HOME (ADD HERE) ================= */}

//         {/* RED TRIANGLE (LEFT) */}
//       {/* ================= CENTER HOME (FIXED) ================= */}

// {/* RED (LEFT) */}
// <Line
//   points={[
//     centerX, centerY,
//     centerX, centerY + centerSize,
//     midX, midY
//   ]}
//   fill="red"
//   closed
// />

// {/* BLUE (TOP) */}
// <Line
//   points={[
//     centerX, centerY,
//     centerX + centerSize, centerY,
//     midX, midY
//   ]}
//   fill="blue"
//   closed
// />

// {/* YELLOW (RIGHT) */}
// <Line
//   points={[
//     centerX + centerSize, centerY,
//     centerX + centerSize, centerY + centerSize,
//     midX, midY
//   ]}
//   fill="yellow"
//   closed
// />

// {/* GREEN (BOTTOM) */}
// <Line
//   points={[
//     centerX, centerY + centerSize,
//     centerX + centerSize, centerY + centerSize,
//     midX, midY
//   ]}
//   fill="green"
//   closed
// />


//       </Layer>
//     </Stage>
//   );
// };

// export default BoardCanvas;











import { Stage, Layer, Rect, Line } from "react-konva";

const SIZE = 450;
const CELL = SIZE / 15;

const BoardCanvas = () => {
  const cells = [];
  const used = new Set();

  const cell = (x, y, color = "#fff") => {
    const key = `${x}-${y}`;
    if (used.has(key)) return;
    used.add(key);

    cells.push(
      <Rect
        key={key}
        x={x * CELL}
        y={y * CELL}
        width={CELL}
        height={CELL}
        fill={color}
        stroke="#999"
      />
    );
  };

  /* ========= MAIN WHITE PATH (52 CELLS) ========= */
  for (let x = 1; x <= 5; x++) cell(x, 6);
  for (let y = 5; y >= 1; y--) cell(6, y);
  for (let y = 1; y <= 5; y++) cell(7, y);
  for (let x = 8; x <= 13; x++) cell(x, 6);

  for (let y = 5; y >= 1; y--) cell(13, y);
  for (let y = 8; y <= 13; y++) cell(13, y);
  for (let x = 12; x >= 8; x--) cell(x, 8);
  for (let y = 9; y <= 13; y++) cell(7, y);

  for (let y = 12; y >= 8; y--) cell(6, y);
  for (let x = 5; x >= 1; x--) cell(x, 8);
  for (let y = 9; y <= 13; y++) cell(1, y);
  for (let y = 7; y >= 6; y--) cell(1, y);

  /* ========= HOME PATHS (5 CELLS EACH) ========= */
  for (let x = 1; x <= 5; x++) cell(x, 7, "#f44336"); // Red
  for (let y = 1; y <= 5; y++) cell(7, y, "#4caf50"); // Green
  for (let x = 9; x <= 13; x++) cell(x, 7, "#fad416"); // Yellow
  for (let y = 9; y <= 13; y++) cell(7, y, "#2196f3"); // Blue

  return (
    <Stage width={SIZE} height={SIZE}>
      <Layer>

        {/* BACKGROUND */}
        <Rect width={SIZE} height={SIZE} fill="#eee" />

        {/* HOMES */}
        <Rect x={0} y={0} width={6 * CELL} height={6 * CELL} fill="#f44336" />
        <Rect x={CELL} y={CELL} width={4 * CELL} height={4 * CELL} fill="#fff" />

        <Rect x={9 * CELL} y={0} width={6 * CELL} height={6 * CELL} fill="#4caf50" />
        <Rect x={10 * CELL} y={CELL} width={4 * CELL} height={4 * CELL} fill="#fff" />

        <Rect x={0} y={9 * CELL} width={6 * CELL} height={6 * CELL} fill="#2196f3" />
        <Rect x={CELL} y={10 * CELL} width={4 * CELL} height={4 * CELL} fill="#fff" />

        <Rect x={9 * CELL} y={9 * CELL} width={6 * CELL} height={6 * CELL} fill="#fad416" />
        <Rect x={10 * CELL} y={10 * CELL} width={4 * CELL} height={4 * CELL} fill="#fff" />

        {/* PATH CELLS */}
        {cells}

        {/* CENTER TRIANGLES */}
        <Line points={[6 * CELL, 6 * CELL, 9 * CELL, 6 * CELL, 7.5 * CELL, 7.5 * CELL]} fill="#4caf50" closed />
        <Line points={[6 * CELL, 6 * CELL, 6 * CELL, 9 * CELL, 7.5 * CELL, 7.5 * CELL]} fill="#f44336" closed />
        <Line points={[9 * CELL, 6 * CELL, 9 * CELL, 9 * CELL, 7.5 * CELL, 7.5 * CELL]} fill="#fad416" closed />
        <Line points={[6 * CELL, 9 * CELL, 9 * CELL, 9 * CELL, 7.5 * CELL, 7.5 * CELL]} fill="#2196f3" closed />

      </Layer>
    </Stage>
  );
};

export default BoardCanvas;
