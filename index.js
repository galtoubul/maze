const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// Basic conig for using matter.js
const width = window.innerWidth * 0.9999;
const height = window.innerHeight * 0.9967;
const rows = 10;
const columns = 14;
const unitWidth = width / columns;
const unitHeight = height / rows;

const engine = Engine.create();
engine.world.gravity.y = 0; // Cancel gravity
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];
World.add(world, walls);

// Maze generation

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
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    // Step
    stepThroughCell(nextRow, nextColumn);
  }
};

const startRow = Math.floor(Math.random() * rows);
const startColumn = Math.floor(Math.random() * columns);
stepThroughCell(startRow, startColumn);

// Draw walls

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitWidth + unitWidth / 2,
      rowIndex * unitHeight + unitHeight,
      unitWidth,
      10,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "white",
        },
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitWidth + unitWidth,
      rowIndex * unitHeight + unitHeight / 2,
      10,
      unitHeight,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "white",
        },
      }
    );
    console.log(wall);
    World.add(world, wall);
  });
});

// Add goal
const goal = Bodies.rectangle(
  width - unitWidth / 2,
  height - unitHeight / 2,
  unitWidth * 0.7,
  unitHeight * 0.7,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "#42aaa2",
    },
  }
);
World.add(world, goal);

// Add ball
const ball = Bodies.circle(
  unitWidth / 2,
  unitHeight / 2,
  Math.min(unitHeight, unitHeight) / 4,
  {
    label: "ball",
    render: {
      fillStyle: "#fe5377",
    },
  }
);
World.add(world, ball);

document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

// Recognize win
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1; // return gravity

      // collapse walls
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });

      // Show win message
      document.querySelector(".winner").classList.remove("hidden");
    }
  });
});
