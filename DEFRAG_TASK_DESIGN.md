# Defragmentation Task Design

## Overview

The Defragmentation task is inspired by classic disk defragmentation visualizations (like Windows Defrag). Players move colored blocks within a grid to eliminate gaps, consolidating all blocks at the top of each column.

## Goal

**Objective**: Move all colored blocks to the top of their columns, eliminating any empty spaces below them.

**Example**:

```
BEFORE (Fragmented):          AFTER (Defragmented):
┌─┬─┬─┬─┐                     ┌─┬─┬─┬─┐
│ │G│ │R│  Row 0              │R│G│B│R│  Row 0
├─┼─┼─┼─┤                     ├─┼─┼─┼─┤
│R│ │B│ │  Row 1              │G│B│ │ │  Row 1
├─┼─┼─┼─┤                     ├─┼─┼─┼─┤
│ │B│ │ │  Row 2              │ │ │ │ │  Row 2
├─┼─┼─┼─┤                     ├─┼─┼─┼─┤
│G│ │ │ │  Row 3              │ │ │ │ │  Row 3
└─┴─┴─┴─┘                     └─┴─┴─┴─┘
```

In the "BEFORE" state:
- Column 0: Has R at row 1 and G at row 3 (gap at row 0 and row 2)
- Column 1: Has G at row 0, B at row 2 (gap at row 1 and row 3)
- Column 2: Has B at row 1 (gaps at rows 0, 2, 3)
- Column 3: Has R at row 0 (gaps at rows 1, 2, 3)

In the "AFTER" state:
- Column 0: R and G are at the top (rows 0-1), no gaps above empty cells
- Column 1: G and B are at the top (rows 0-1), no gaps above empty cells
- Column 2: B is at the top (row 0), no gaps above empty cells
- Column 3: R is at the top (row 0), no gaps above empty cells

## UI Components

### Grid Display

- **Grid Size**: Varies by difficulty
  - Difficulty 1: 5 rows × 4 columns (20 cells)
  - Difficulty 2: 6 rows × 5 columns (30 cells)
  - Difficulty 3: 8 rows × 6 columns (48 cells)

- **Block Types**: 2-4 colored blocks
  - **R** (Red): Red background
  - **G** (Green): Green background
  - **B** (Blue): Blue background
  - **Y** (Yellow): Yellow background

- **Empty Cells**: White background, represents gaps

### Visual Indicators

- **Normal Cell**: Standard border
- **Selected Cell**: Yellow ring (ring-4 ring-yellow-400) and slightly scaled up
- **Hover**: Scale effect and shadow on colored blocks

## Interaction Mechanics

The defragmentation uses a **click-to-swap** mechanic:

### Step-by-Step Interaction

1. **First Click - Select a Cell**
   - Player clicks any cell (empty or colored)
   - Cell gets highlighted with yellow ring
   - This becomes the "selected cell"

2. **Second Click - Swap or Reselect**
   - **Same Cell**: Clicking the selected cell again deselects it
   - **Different Column**: Deselects current cell and selects the new cell (no swap)
   - **Same Column, Different Row**: Swaps the two cells and increments move counter

3. **After Swap**
   - Selected cell is cleared (back to null)
   - Move counter increases by 1
   - Grid state updates with new positions

### Example Interaction Sequence

```
Initial Grid:
┌─┬─┬─┬─┐
│ │G│ │R│  Row 0
├─┼─┼─┼─┤
│R│ │B│ │  Row 1
├─┼─┼─┼─┤
│ │B│ │ │  Row 2
├─┼─┼─┼─┤
│G│ │ │ │  Row 3
└─┴─┴─┴─┘

Action 1: Click (3, 0) - selects G in column 0, row 3
Action 2: Click (0, 0) - swaps empty cell and G
Move Count: 1

Result:
┌─┬─┬─┬─┐
│G│G│ │R│  Row 0  ← G moved up
├─┼─┼─┼─┤
│R│ │B│ │  Row 1
├─┼─┼─┼─┤
│ │B│ │ │  Row 2
├─┼─┼─┼─┤
│ │ │ │ │  Row 3  ← Empty now
└─┴─┴─┴─┘

Action 3: Click (1, 0) - selects R in column 0, row 1
Action 4: Click (2, 0) - swaps R and empty cell
Move Count: 2

Result:
┌─┬─┬─┬─┐
│G│G│ │R│  Row 0
├─┼─┼─┼─┤
│ │ │B│ │  Row 1  ← Empty now
├─┼─┼─┼─┤
│R│B│ │ │  Row 2  ← R moved down (not optimal!)
├─┼─┼─┼─┤
│ │ │ │ │  Row 3
└─┴─┴─┴─┘

Action 5: Click (2, 0) - selects R
Action 6: Click (1, 0) - swaps R back up
Move Count: 3

Result:
┌─┬─┬─┬─┐
│G│G│ │R│  Row 0
├─┼─┼─┼─┤
│R│ │B│ │  Row 1  ← R at top, column 0 complete!
├─┼─┼─┼─┤
│ │B│ │ │  Row 2
├─┼─┼─┼─┤
│ │ │ │ │  Row 3
└─┴─┴─┴─┘
```

## Validation Logic

### Completion Check (Frontend)

The task is complete when **every column** has all its blocks at the top with no gaps:

```typescript
function isDefragmented(): boolean {
  for (let col = 0; col < cols; col++) {
    let foundEmpty = false
    for (let row = 0; row < rows; row++) {
      if (grid[row][col] === '') {
        foundEmpty = true  // Found an empty cell
      } else if (foundEmpty) {
        return false  // Found a block AFTER an empty cell - not defragmented!
      }
    }
  }
  return true  // All columns have blocks at top
}
```

**Valid Column Examples**:
- `[R, G, '', '']` ✅ Two blocks at top, gaps below
- `[B, '', '', '']` ✅ One block at top, gaps below
- `['', '', '', '']` ✅ All empty (no blocks to defrag)
- `[R, G, B, Y]` ✅ Full column, no gaps

**Invalid Column Examples**:
- `['', R, G, '']` ❌ Gap at top, blocks below
- `[R, '', G, '']` ❌ Gap in middle
- `['', '', R, '']` ❌ Block not at top

### Backend Validation

When submitted, the backend validator checks:

1. **Grid Dimensions**: Submitted grid has correct rows × cols
2. **Block Conservation**: Same blocks exist (none added/removed)
   - Counts each block type (R, G, B, Y)
   - Compares original vs submitted counts
3. **Defragmentation**: Uses same algorithm as frontend
4. **Scoring**: Compares move count to optimal solution
   - Optimal moves calculated by backend
   - Efficiency = 100% if moves ≤ optimal
   - Penalty for extra moves

## Strategy Tips

### Efficient Approach

1. **Work Column by Column**: Complete one column before moving to next
2. **Move Bottom-to-Top**: Start with lowest block, swap it upward
3. **Minimize Moves**: Think ahead to avoid unnecessary swaps

### Example Strategy for One Column

```
Target: Defragment column 1
Initial:     Step 1:      Step 2:      Final:
│ │ Row 0    │ │ Row 0    │B│ Row 0    │B│ Row 0
├─┤          ├─┤          ├─┤          ├─┤
│ │ Row 1    │B│ Row 1    │G│ Row 1    │G│ Row 1
├─┤          ├─┤          ├─┤          ├─┤
│B│ Row 2 →  │ │ Row 2 →  │ │ Row 2 →  │ │ Row 2
├─┤          ├─┤          ├─┤          ├─┤
│G│ Row 3    │G│ Row 3    │ │ Row 3    │ │ Row 3

Move 1: Swap (2,1) with (1,1) - Move B up
Move 2: Swap (3,1) with (2,1) - Move G up
Move 3: Swap (2,1) with (1,1) - Move G to final position
Total: 3 moves
```

## Difficulty Progression

### Difficulty 1 (Easy)
- **Grid**: 5×4 (20 cells)
- **Blocks**: 2 types (R, G)
- **Fill**: 50% (10 blocks)
- **Reward**: 15-20 tokens
- **Time**: ~60 seconds

### Difficulty 2 (Medium)
- **Grid**: 6×5 (30 cells)
- **Blocks**: 3 types (R, G, B)
- **Fill**: 60% (18 blocks)
- **Reward**: 20-25 tokens
- **Time**: ~90 seconds

### Difficulty 3 (Hard)
- **Grid**: 8×6 (48 cells)
- **Blocks**: 4 types (R, G, B, Y)
- **Fill**: 70% (34 blocks)
- **Reward**: 25-30 tokens
- **Time**: ~120 seconds

## Technical Implementation

### Data Structure

**Task Data** (from backend):
```typescript
{
  grid: string[][]  // 2D array: [row][col], values: '', 'R', 'G', 'B', 'Y'
  rows: number
  cols: number
}
```

**Solution Submission**:
```typescript
{
  grid: string[][]  // Defragmented grid
  moveCount: number // Number of swaps made
}
```

### State Management

```typescript
const [grid, setGrid] = useState<string[][]>(data.grid.map(row => [...row]))
const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
const [moveCount, setMoveCount] = useState(0)
```

### Swap Logic

```typescript
// Swap two cells in the same column
const newGrid = grid.map(r => [...r])
const temp = newGrid[row1][col]
newGrid[row1][col] = newGrid[row2][col]
newGrid[row2][col] = temp
```

## Comparison to Other Task Types

| Aspect | Sort List | Group Separation | Defragmentation |
|--------|-----------|------------------|------------------|
| Interaction | Drag items in list | Drag items to buckets | Click to swap cells |
| Constraint | Linear order | Categorical groups | Column-based gaps |
| Freedom | Any order during solve | Move anywhere | Only same-column swaps |
| Validation | Check final order | Check group membership | Check gaps per column |
| Difficulty | List length | Item count + attributes | Grid size + fill % |

## Design Rationale

### Why Click-to-Swap?

- **Simple**: Only requires two clicks per move
- **Precise**: Players can carefully plan each swap
- **Mobile-Friendly**: Works well on touch screens
- **Constrained**: Same-column restriction adds strategic depth

### Why Column-Based?

- **Visual Clarity**: Easy to see progress column by column
- **Intuitive Goal**: "Blocks fall to top" is easy to understand
- **Incremental Progress**: Can complete one column at a time
- **Familiar**: Similar to classic defrag and falling block games

### Why Track Move Count?

- **Skill Expression**: Better players use fewer moves
- **Scoring**: Backend can reward efficiency
- **Feedback**: Players can try to improve their solution
- **Future Feature**: Could show "par" move count for each task
