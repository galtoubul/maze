const { Engine, Render, Runner, World, Bodies } = Matter;

// Basic conig for using matter.js
const width = 600;
const height = 600;
const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];
World.add(world, walls);

// Maze generation

const rows = 3;
const columns = 3;

// 2D array representing the visited cell (true iff visited)
const grid = Array(rows)
  .fill(null)
  .map(() => Array(columns).fill(false));

// 2D array representing the vertical borders (false iff the border exists)
const verticals = Array(rows)
  .fill(null)
  .map(() => Array(columns - 1).fill(false));

// 2D array representing the horizontal borders (false iff the border exists)
const horizontals = Array(rows - 1)
  .fill(null)
  .map(() => Array(columns).fill(false));

const stepThroughCell = (row, column) => {
  if (grid[row][column]) {
    return;
  }
  grid[row][column] = true;
  const neighbors = [
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ];
  shuffle(neighbors);
  console.log(neighbors);

  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // Ignore non valid step / visited cell
    if (
      nextRow >= rows ||
      nextRow < 0 ||
      nextColumn >= columns ||
      nextColumn < 0 ||
      grid[nextRow][nextColumn]
    ) {
      continue;
    }

    // Make a step

    // Update borders
    updatedColumn = direction === "left" ? column - 1 : column;
    verticals[row][updatedColumn] = true;
    updatedRow = direction === "up" ? row - 1 : row;
    horizontals[updatedRow][column] = true;

    // Step
    stepThroughCell(nextRow, nextColumn);
  }
};

const startRow = Math.floor(Math.random() * rows);
const startColumn = Math.floor(Math.random() * columns);
stepThroughCell(startRow, startColumn);


