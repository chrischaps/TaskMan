// Task Generation Service
// Generates random tasks for testing and seeding
// Based on GDD.md Section 4 (Task System Design)

import type {
  SortListData,
  ColorMatchData,
  ArithmeticData,
  GroupSeparationData,
  DefragData,
} from '../validators/taskValidators';

// ============================================================================
// Task Generation Options
// ============================================================================

export interface TaskGenerationOptions {
  difficulty?: 1 | 2 | 3 | 4 | 5; // 1-5 star difficulty
  isTutorial?: boolean;
}

export interface GeneratedTask {
  type: string;
  title: string;
  description: string;
  data: any;
  solution: any;
  tokenReward: number;
  difficulty: number;
  estimatedTime: number; // seconds
}

// ============================================================================
// Word Lists for Generation
// ============================================================================

const FIRST_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah',
  'Isaac', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nancy', 'Oliver', 'Patricia',
  'Quinn', 'Rachel', 'Samuel', 'Teresa', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yolanda', 'Zachary', 'Amy', 'Brian', 'Catherine', 'Daniel',
];

const ANIMALS = [
  'Elephant', 'Giraffe', 'Penguin', 'Kangaroo', 'Dolphin', 'Tiger', 'Bear',
  'Zebra', 'Lion', 'Monkey', 'Rabbit', 'Fox', 'Deer', 'Wolf', 'Owl',
];

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown'];
const SHAPES = ['circle', 'square', 'triangle', 'rectangle', 'pentagon'];
const SIZES = ['small', 'medium', 'large'];

// ============================================================================
// Utility Functions
// ============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// Sort List Task Generator
// ============================================================================

export function generateSortListTask(options: TaskGenerationOptions = {}): GeneratedTask {
  const difficulty = options.difficulty || randomInt(1, 3);
  const isTutorial = options.isTutorial || false;

  // Determine parameters based on difficulty
  const itemCount = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
  const sortCriteria = randomElement<'alphabetical' | 'numerical' | 'length'>([
    'alphabetical',
    'numerical',
    'length',
  ]);

  let items: string[];
  let title: string;
  let description: string;

  if (sortCriteria === 'alphabetical') {
    items = shuffle(FIRST_NAMES).slice(0, itemCount);
    title = `Sort ${itemCount} Names Alphabetically`;
    description = `Arrange these names in alphabetical order (A to Z).`;
  } else if (sortCriteria === 'numerical') {
    const max = difficulty === 1 ? 50 : difficulty === 2 ? 100 : 500;
    items = Array.from({ length: itemCount }, () => String(randomInt(1, max)));
    title = `Sort ${itemCount} Numbers`;
    description = `Arrange these numbers from smallest to largest.`;
  } else {
    // length
    const words = shuffle([...ANIMALS, ...FIRST_NAMES]).slice(0, itemCount);
    items = words;
    title = `Sort ${itemCount} Words by Length`;
    description = `Arrange these words from shortest to longest.`;
  }

  // Calculate solution
  const sortedItems = [...items].sort((a, b) => {
    if (sortCriteria === 'alphabetical') {
      return a.localeCompare(b);
    } else if (sortCriteria === 'numerical') {
      return parseFloat(a) - parseFloat(b);
    } else {
      return a.length - b.length;
    }
  });

  const data: SortListData = {
    items: shuffle(items), // Randomize order
    sortCriteria,
  };

  const solution = { sortedItems };

  // Token reward: 5-10 tokens (15-30 seconds)
  const tokenReward = isTutorial ? 10 : randomInt(5, 10);
  const estimatedTime = 15 + (itemCount * 2);

  return {
    type: 'sort_list',
    title,
    description,
    data,
    solution,
    tokenReward,
    difficulty,
    estimatedTime,
  };
}

// ============================================================================
// Color Match Task Generator
// ============================================================================

export function generateColorMatchTask(options: TaskGenerationOptions = {}): GeneratedTask {
  const difficulty = options.difficulty || randomInt(1, 3);
  const isTutorial = options.isTutorial || false;

  // Tolerance decreases with difficulty (GDD specifies 5% accuracy)
  // Using stricter tolerances to ensure visual accuracy
  const tolerance = difficulty === 1 ? 8 : difficulty === 2 ? 5 : 3;

  // Generate random target color
  const targetColor = {
    r: randomInt(0, 255),
    g: randomInt(0, 255),
    b: randomInt(0, 255),
  };

  const hexColor = `#${targetColor.r.toString(16).padStart(2, '0')}${targetColor.g
    .toString(16)
    .padStart(2, '0')}${targetColor.b.toString(16).padStart(2, '0')}`.toUpperCase();

  const data: ColorMatchData = {
    targetColor,
    tolerance,
  };

  const solution = { submittedColor: targetColor };

  const title = `Match Color ${hexColor}`;
  const description = `Use the RGB sliders to match the target color within ${tolerance}% accuracy.`;

  // Token reward: 10-20 tokens (30-60 seconds)
  const tokenReward = isTutorial ? 15 : randomInt(10, 20);
  const estimatedTime = 30 + (difficulty * 10);

  return {
    type: 'color_match',
    title,
    description,
    data,
    solution,
    tokenReward,
    difficulty,
    estimatedTime,
  };
}

// ============================================================================
// Arithmetic Task Generator
// ============================================================================

export function generateArithmeticTask(options: TaskGenerationOptions = {}): GeneratedTask {
  const difficulty = options.difficulty || randomInt(1, 3);
  const isTutorial = options.isTutorial || false;

  let expression: string;
  let correctAnswer: number;

  if (difficulty === 1) {
    // Simple addition/subtraction
    const a = randomInt(10, 50);
    const b = randomInt(10, 50);
    const op = randomElement(['+', '-']);
    expression = `${a} ${op} ${b}`;
    correctAnswer = op === '+' ? a + b : a - b;
  } else if (difficulty === 2) {
    // Two operations
    const a = randomInt(10, 50);
    const b = randomInt(2, 10);
    const c = randomInt(10, 50);
    const op1 = randomElement(['*', '+']);
    const op2 = randomElement(['+', '-']);
    expression = `(${a} ${op1} ${b}) ${op2} ${c}`;
    const step1 = op1 === '*' ? a * b : a + b;
    correctAnswer = op2 === '+' ? step1 + c : step1 - c;
  } else {
    // Three operations with mixed precedence
    const a = randomInt(20, 50);
    const b = randomInt(2, 10);
    const c = randomInt(50, 150);
    const d = randomInt(20, 100);
    expression = `(${a} * ${b}) + ${c} - ${d}`;
    correctAnswer = a * b + c - d;
  }

  const data: ArithmeticData = {
    expression,
    correctAnswer,
  };

  const solution = { answer: correctAnswer };

  const title = `Calculate: ${expression}`;
  const description = `Solve this arithmetic expression and enter the result.`;

  // Token reward: 5-12 tokens (10-30 seconds)
  const tokenReward = isTutorial ? 8 : randomInt(5, 12);
  const estimatedTime = 10 + (difficulty * 8);

  return {
    type: 'arithmetic',
    title,
    description,
    data,
    solution,
    tokenReward,
    difficulty,
    estimatedTime,
  };
}

// ============================================================================
// Group Separation Task Generator
// ============================================================================

export function generateGroupSeparationTask(
  options: TaskGenerationOptions = {}
): GeneratedTask {
  const difficulty = options.difficulty || randomInt(1, 3);
  const isTutorial = options.isTutorial || false;

  // Number of items and groups based on difficulty
  const groupCount = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
  const itemsPerGroup = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
  const totalItems = groupCount * itemsPerGroup;

  const groupBy = randomElement(['color', 'shape', 'size']);

  let attributeValues: string[];

  if (groupBy === 'color') {
    attributeValues = shuffle(COLORS).slice(0, groupCount);
  } else if (groupBy === 'shape') {
    attributeValues = shuffle(SHAPES).slice(0, groupCount);
  } else {
    // size
    attributeValues = SIZES.slice(0, groupCount);
  }

  // Generate items
  const items = [];
  let idCounter = 0;

  for (const value of attributeValues) {
    for (let i = 0; i < itemsPerGroup; i++) {
      const item = {
        id: `item-${idCounter++}`,
        attributes: {
          [groupBy]: value,
          // Add other random attributes
          ...(groupBy !== 'color' && { color: randomElement(COLORS) }),
          ...(groupBy !== 'shape' && { shape: randomElement(SHAPES) }),
          ...(groupBy !== 'size' && { size: randomElement(SIZES) }),
        },
      };
      items.push(item);
    }
  }

  // Shuffle items
  const shuffledItems = shuffle(items);

  // Calculate solution
  const groups: Record<string, string[]> = {};
  for (const item of items) {
    const attrs = item.attributes as Record<string, string>;
    const groupKey = attrs[groupBy];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item.id);
  }

  const data: GroupSeparationData = {
    items: shuffledItems,
    groupBy,
  };

  const solution = { groups };

  const title = `Group ${totalItems} Items by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`;
  const description = `Drag each item into the correct group based on its ${groupBy}.`;

  // Token reward: 8-15 tokens (20-45 seconds)
  const tokenReward = isTutorial ? 12 : randomInt(8, 15);
  const estimatedTime = 20 + (totalItems * 1.5);

  return {
    type: 'group_separation',
    title,
    description,
    data,
    solution,
    tokenReward,
    difficulty,
    estimatedTime,
  };
}

// ============================================================================
// Defragmentation Task Generator
// ============================================================================

export function generateDefragmentationTask(
  options: TaskGenerationOptions = {}
): GeneratedTask {
  const difficulty = options.difficulty || randomInt(1, 3);
  const isTutorial = options.isTutorial || false;

  // Grid size based on difficulty
  const rows = difficulty === 1 ? 5 : difficulty === 2 ? 6 : 8;
  const cols = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;

  // Number of block types
  const blockTypes = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;
  const blockColors = ['R', 'G', 'B', 'Y'].slice(0, blockTypes);

  // Fill percentage (how full the grid is)
  const fillPercentage = difficulty === 1 ? 0.5 : difficulty === 2 ? 0.6 : 0.7;
  const totalCells = rows * cols;
  const filledCells = Math.floor(totalCells * fillPercentage);

  // Create empty grid
  const grid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => '')
  );

  // Randomly place blocks
  const positions: Array<[number, number]> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push([r, c]);
    }
  }
  shuffle(positions);

  // Fill cells with blocks
  for (let i = 0; i < filledCells; i++) {
    const [r, c] = positions[i];
    grid[r][c] = randomElement(blockColors);
  }

  // Generate defragmented solution (blocks at top)
  const defragmentedGrid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => '')
  );

  for (let col = 0; col < cols; col++) {
    const columnBlocks: string[] = [];
    for (let row = 0; row < rows; row++) {
      if (grid[row][col] !== '') {
        columnBlocks.push(grid[row][col]);
      }
    }
    // Place blocks at top
    for (let i = 0; i < columnBlocks.length; i++) {
      defragmentedGrid[i][col] = columnBlocks[i];
    }
  }

  const data: DefragData = {
    grid,
    rows,
    cols,
  };

  const solution = {
    grid: defragmentedGrid,
    moveCount: 0, // Placeholder - actual moves depend on user strategy
  };

  const title = `Defragment ${rows}x${cols} Grid`;
  const description = `Move all blocks to the top of each column, eliminating gaps.`;

  // Token reward: 15-30 tokens (60-120 seconds)
  const tokenReward = isTutorial ? 20 : randomInt(15, 30);
  const estimatedTime = 60 + (filledCells * 2);

  return {
    type: 'defragmentation',
    title,
    description,
    data,
    solution,
    tokenReward,
    difficulty,
    estimatedTime,
  };
}

// ============================================================================
// Main Task Generator
// ============================================================================

/**
 * Generate a random task of any type
 */
export function generateRandomTask(options: TaskGenerationOptions = {}): GeneratedTask {
  const taskType = randomElement([
    'sort_list',
    'color_match',
    'arithmetic',
    'group_separation',
    'defragmentation',
  ]);

  return generateTaskByType(taskType, options);
}

/**
 * Generate a task of a specific type
 */
export function generateTaskByType(
  type: string,
  options: TaskGenerationOptions = {}
): GeneratedTask {
  switch (type) {
    case 'sort_list':
      return generateSortListTask(options);
    case 'color_match':
      return generateColorMatchTask(options);
    case 'arithmetic':
      return generateArithmeticTask(options);
    case 'group_separation':
      return generateGroupSeparationTask(options);
    case 'defragmentation':
      return generateDefragmentationTask(options);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

/**
 * Generate a set of tutorial tasks (one of each type)
 */
export function generateTutorialTasks(): GeneratedTask[] {
  const types = [
    'sort_list',
    'color_match',
    'arithmetic',
    'group_separation',
    'defragmentation',
  ];

  return types.map((type) =>
    generateTaskByType(type, { difficulty: 1, isTutorial: true })
  );
}
