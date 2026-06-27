export const createMainPath = (CELL) => {
  const path = [];

  const c = (x, y) => ({
    x: x * CELL + CELL / 2,
    y: y * CELL + CELL / 2,
  });

  // TOP
  for (let i = 1; i <= 5; i++) path.push(c(i, 6));
  for (let i = 6; i <= 8; i++) path.push(c(6, i));

  // RIGHT
  for (let i = 7; i <= 13; i++) path.push(c(i, 8));
  for (let i = 7; i >= 6; i--) path.push(c(8, i));

  // BOTTOM
  for (let i = 8; i >= 1; i--) path.push(c(i, 8));
  for (let i = 9; i <= 13; i++) path.push(c(6, i));

  // LEFT
  for (let i = 6; i <= 8; i++) path.push(c(i, 6));
  for (let i = 8; i >= 1; i--) path.push(c(8, i));

  return path.slice(0, 52);
};
