// Task Validation System
// Based on TDD.md Section 5.1

// ============================================================================
// Validation Result Interface
// ============================================================================

export interface ValidationResult {
  isCorrect: boolean;
  details: string;
  score?: number; // Optional partial credit score (0-100)
}

// ============================================================================
// Task Data & Solution Interfaces
// ============================================================================

// Sort List Task
export interface SortListData {
  items: string[];
  sortCriteria: 'alphabetical' | 'numerical' | 'length';
}

export interface SortListSolution {
  sortedItems: string[];
}

// Color Match Task
export interface ColorMatchData {
  targetColor: { r: number; g: number; b: number };
  tolerance: number; // Percentage (e.g., 10 means 10%)
}

export interface ColorMatchSolution {
  submittedColor: { r: number; g: number; b: number };
}

// Arithmetic Task
export interface ArithmeticData {
  expression: string; // e.g., "(45 * 3) + 127 - 89"
  correctAnswer: number;
}

export interface ArithmeticSolution {
  answer: number;
}

// Group Separation Task
export interface GroupSeparationData {
  items: Array<{
    id: string;
    attributes: Record<string, string>; // e.g., { color: 'red', shape: 'circle' }
  }>;
  groupBy: string; // Attribute name to group by
}

export interface GroupSeparationSolution {
  groups: Record<string, string[]>; // groupName -> array of item IDs
}

// Defragmentation Task
export interface DefragData {
  grid: string[][]; // 2D array of colors or IDs ('R', 'G', 'B', or empty '')
  rows: number;
  cols: number;
}

export interface DefragSolution {
  grid: string[][]; // Defragmented grid
  moveCount: number; // Number of moves taken
}

// ============================================================================
// Validator Functions
// ============================================================================

/**
 * Validates Sort List task submissions
 * Supports alphabetical, numerical, and length-based sorting
 */
export function validateSortList(
  solution: SortListSolution,
  taskData: SortListData
): ValidationResult {
  const expectedSorted = [...taskData.items].sort((a, b) => {
    if (taskData.sortCriteria === 'alphabetical') {
      return a.localeCompare(b);
    } else if (taskData.sortCriteria === 'numerical') {
      return parseFloat(a) - parseFloat(b);
    } else if (taskData.sortCriteria === 'length') {
      return a.length - b.length;
    }
    return 0;
  });

  const isCorrect =
    JSON.stringify(solution.sortedItems) === JSON.stringify(expectedSorted);

  return {
    isCorrect,
    details: isCorrect ? 'Perfect sort!' : 'Sort order is incorrect',
  };
}

/**
 * Validates Color Match task submissions
 * Calculates RGB color difference and applies tolerance
 */
export function validateColorMatch(
  solution: ColorMatchSolution,
  taskData: ColorMatchData
): ValidationResult {
  const { r: tr, g: tg, b: tb } = taskData.targetColor;
  const { r: sr, g: sg, b: sb } = solution.submittedColor;

  const tolerance = taskData.tolerance / 100; // Convert percentage to decimal

  const rDiff = Math.abs(tr - sr) / 255;
  const gDiff = Math.abs(tg - sg) / 255;
  const bDiff = Math.abs(tb - sb) / 255;

  const avgDiff = (rDiff + gDiff + bDiff) / 3;
  const isCorrect = avgDiff <= tolerance;

  return {
    isCorrect,
    details: isCorrect
      ? `Great match! Accuracy: ${((1 - avgDiff) * 100).toFixed(1)}%`
      : `Too far off. Accuracy: ${((1 - avgDiff) * 100).toFixed(1)}%`,
    score: Math.max(0, 100 - avgDiff * 100),
  };
}

/**
 * Validates Arithmetic task submissions
 * Compares submitted answer with correct answer
 */
export function validateArithmetic(
  solution: ArithmeticSolution,
  taskData: ArithmeticData
): ValidationResult {
  const isCorrect = solution.answer === taskData.correctAnswer;

  return {
    isCorrect,
    details: isCorrect
      ? `Correct! ${taskData.expression} = ${taskData.correctAnswer}`
      : `Incorrect. Your answer: ${solution.answer}, Correct answer: ${taskData.correctAnswer}`,
  };
}

/**
 * Validates Group Separation task submissions
 * Checks if items are correctly grouped by specified attribute
 */
export function validateGroupSeparation(
  solution: GroupSeparationSolution,
  taskData: GroupSeparationData
): ValidationResult {
  // Build expected groups
  const expectedGroups: Record<string, Set<string>> = {};

  for (const item of taskData.items) {
    const groupKey = item.attributes[taskData.groupBy];
    if (!expectedGroups[groupKey]) {
      expectedGroups[groupKey] = new Set();
    }
    expectedGroups[groupKey].add(item.id);
  }

  // Compare with submitted groups
  let correctGroups = 0;
  const totalGroups = Object.keys(expectedGroups).length;

  for (const [groupName, expectedItems] of Object.entries(expectedGroups)) {
    const submittedItems = new Set(solution.groups[groupName] || []);

    if (setsEqual(expectedItems, submittedItems)) {
      correctGroups++;
    }
  }

  const isCorrect = correctGroups === totalGroups;

  return {
    isCorrect,
    details: isCorrect
      ? 'All groups correct!'
      : `${correctGroups}/${totalGroups} groups correct`,
    score: (correctGroups / totalGroups) * 100,
  };
}

/**
 * Validates Defragmentation task submissions
 * Checks if all blocks are moved to the top with no gaps
 */
export function validateDefragmentation(
  solution: DefragSolution,
  taskData: DefragData
): ValidationResult {
  const { grid: submittedGrid, moveCount } = solution;
  const { rows, cols } = taskData;

  // Validate grid dimensions
  if (submittedGrid.length !== rows) {
    return {
      isCorrect: false,
      details: 'Invalid grid dimensions: wrong number of rows',
    };
  }

  for (const row of submittedGrid) {
    if (row.length !== cols) {
      return {
        isCorrect: false,
        details: 'Invalid grid dimensions: wrong number of columns',
      };
    }
  }

  // Count blocks in original and submitted grids
  const originalBlocks = countBlocks(taskData.grid);
  const submittedBlocks = countBlocks(submittedGrid);

  // Verify same number of blocks (no blocks lost or created)
  if (!blocksEqual(originalBlocks, submittedBlocks)) {
    return {
      isCorrect: false,
      details: 'Block count mismatch: blocks were added or removed',
    };
  }

  // Check if defragmentation is correct (all blocks at top, no gaps)
  const isDefragmented = checkDefragmentation(submittedGrid, cols);

  if (!isDefragmented) {
    return {
      isCorrect: false,
      details: 'Grid is not properly defragmented: blocks must be at the top with no gaps',
    };
  }

  // Calculate optimal move count (for scoring)
  const optimalMoves = calculateOptimalMoves(taskData.grid);
  const efficiency = Math.max(0, 100 - ((moveCount - optimalMoves) / optimalMoves) * 50);

  return {
    isCorrect: true,
    details: `Defragmentation complete! Moves: ${moveCount} (optimal: ${optimalMoves})`,
    score: efficiency,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if two sets are equal
 */
function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

/**
 * Counts blocks by type in a grid
 */
function countBlocks(grid: string[][]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== '') {
        counts[cell] = (counts[cell] || 0) + 1;
      }
    }
  }
  return counts;
}

/**
 * Checks if two block count objects are equal
 */
function blocksEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i] || a[keysA[i]] !== b[keysB[i]]) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a grid is properly defragmented
 * All blocks should be at the top of each column with no gaps
 */
function checkDefragmentation(grid: string[][], cols: number): boolean {
  for (let col = 0; col < cols; col++) {
    let foundEmpty = false;

    for (let row = 0; row < grid.length; row++) {
      const cell = grid[row][col];

      if (cell === '') {
        foundEmpty = true;
      } else if (foundEmpty) {
        // Found a block after an empty cell - not defragmented
        return false;
      }
    }
  }

  return true;
}

/**
 * Calculates optimal number of moves for defragmentation
 * Each block needs to move to fill gaps above it
 */
function calculateOptimalMoves(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let moves = 0;

  for (let col = 0; col < cols; col++) {
    let targetRow = 0; // Next empty position at the top

    for (let row = 0; row < rows; row++) {
      if (grid[row][col] !== '') {
        // Block found - calculate how many positions it needs to move
        if (row !== targetRow) {
          moves += row - targetRow;
        }
        targetRow++;
      }
    }
  }

  return moves;
}

// ============================================================================
// Main Validation Router
// ============================================================================

/**
 * Routes validation to appropriate validator based on task type
 */
export function validateTask(
  taskType: string,
  solution: any,
  taskData: any
): ValidationResult {
  switch (taskType) {
    case 'sort_list':
      return validateSortList(solution, taskData);

    case 'color_match':
      return validateColorMatch(solution, taskData);

    case 'arithmetic':
      return validateArithmetic(solution, taskData);

    case 'group_separation':
      return validateGroupSeparation(solution, taskData);

    case 'defragmentation':
      return validateDefragmentation(solution, taskData);

    default:
      return {
        isCorrect: false,
        details: `Unknown task type: ${taskType}`,
      };
  }
}
