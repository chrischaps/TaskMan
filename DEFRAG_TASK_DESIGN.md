# Defragmentation Task Design

## Overview

The Defragmentation task is inspired by classic disk defragmentation visualizations. Players rearrange colored blocks in a grid to group same-colored blocks together contiguously. The goal is to organize the "fragmented" colors into consolidated groups when read left-to-right, top-to-bottom.

## Goal

**Objective**: Arrange all colored blocks so that each color forms a contiguous group when the grid is read left-to-right, top-to-bottom (like reading text). Empty spaces should be at the end.

**Reading Order**: The grid is read like text - left-to-right on each row, then moving to the next row.

**Example**:

```
BEFORE (Fragmented):          AFTER (Defragmented):
┌─┬─┬─┬─┐                     ┌─┬─┬─┬─┐
│ │G│ │R│  Row 0              │R│R│G│G│  Row 0
├─┼─┼─┼─┤                     ├─┼─┼─┼─┤
│R│ │B│ │  Row 1              │B│B│ │ │  Row 1
├─┼─┼─┼─┤                     ├─┼─┼─┼─┤
│ │B│ │ │  Row 2              │ │ │ │ │  Row 2
├─┼─┼─┼─┤                     ├─┼─┼─┼─┤
│G│ │ │ │  Row 3              │ │ │ │ │  Row 3
└─┴─┴─┴─┘                     └─┴─┴─┴─┘

Reading Order BEFORE:          Reading Order AFTER:
_, G, _, R, R, _, B, _,        R, R, G, G, B, B, _, _,
_, B, _, _, G, _, _, _         _, _, _, _, _, _, _, _
❌ Colors scattered            ✅ All Rs together, then Gs, then Bs
```

In the "BEFORE" state:
- Reading order: [empty, G, empty, R, R, empty, B, empty, empty, B, empty, empty, G, ...]
- R appears at positions 3 and 4 (contiguous ✓)
- G appears at positions 1 and 12 (separated ✗)
- B appears at positions 6 and 9 (separated ✗)

In the "AFTER" state:
- Reading order: [R, R, G, G, B, B, empty, empty, ...]
- R appears at positions 0-1 (contiguous ✓)
- G appears at positions 2-3 (contiguous ✓)
- B appears at positions 4-5 (contiguous ✓)
- All empties at the end ✓

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
   - **Any Other Cell**: Swaps the two cells and increments move counter

3. **After Swap**
   - Selected cell is cleared (back to null)
   - Move counter increases by 1
   - Grid state updates with new positions
   - Any two cells can be swapped (no column/row restrictions)

### Example Interaction Sequence

```
Initial Grid:
┌─┬─┬─┬─┐
│ │G│ │R│  Row 0   Reading: _, G, _, R, R, _, B, _, _, B, _, _, G, _, _, _
├─┼─┼─┼─┤           Status: Rs contiguous ✓, Gs separated ✗, Bs separated ✗
│R│ │B│ │  Row 1
├─┼─┼─┼─┤
│ │B│ │ │  Row 2
├─┼─┼─┼─┤
│G│ │ │ │  Row 3
└─┴─┴─┴─┘

Goal: Arrange to have all Rs together, then all Gs together, then all Bs together

Action 1: Click (0, 0) - select empty cell
Action 2: Click (3, 0) - swap with G
Move Count: 1

Result:
┌─┬─┬─┬─┐
│G│G│ │R│  Row 0   Reading: G, G, _, R, R, _, B, _, _, B, _, _, _, _, _, _
├─┼─┼─┼─┤           Status: Rs still good ✓, Gs now contiguous ✓, Bs still separated ✗
│R│ │B│ │  Row 1
├─┼─┼─┼─┤
│ │B│ │ │  Row 2
├─┼─┼─┼─┤
│ │ │ │ │  Row 3
└─┴─┴─┴─┘

Action 3: Click (1, 0) - select R
Action 4: Click (0, 2) - different column, just reselects

Let's try again...
Action 3: Click (0, 2) - select empty
Action 4: Click (1, 2) - swap with B
Move Count: 2

Result:
┌─┬─┬─┬─┐
│G│G│B│R│  Row 0   Reading: G, G, B, R, R, _, _, _, _, B, _, _, _, _, _, _
├─┼─┼─┼─┤           Status: Rs good ✓, Gs good ✓, Bs separated ✗
│R│ │ │ │  Row 1
├─┼─┼─┼─┤
│ │B│ │ │  Row 2
├─┼─┼─┼─┤
│ │ │ │ │  Row 3
└─┴─┴─┴─┘

Action 5: Click (0, 3) - select R
Action 6: Click (1, 3) - swap with empty
Move Count: 3

Result:
┌─┬─┬─┬─┐
│G│G│B│ │  Row 0   Reading: G, G, B, _, R, _, _, _, _, B, _, _, _, _, _, _
├─┼─┼─┼─┤           Now we need to move blocks around more...
│R│ │ │R│  Row 1
├─┼─┼─┼─┤
│ │B│ │ │  Row 2
├─┼─┼─┼─┤
│ │ │ │ │  Row 3
└─┴─┴─┴─┘

... (several more moves to group Rs, then Gs, then Bs) ...

Final Result:
┌─┬─┬─┬─┐
│R│R│G│G│  Row 0   Reading: R, R, G, G, B, B, _, _, _, _, _, _, _, _, _, _
├─┼─┼─┼─┤           ✅ All Rs contiguous (0-1)
│B│B│ │ │  Row 1   ✅ All Gs contiguous (2-3)
├─┼─┼─┼─┤           ✅ All Bs contiguous (4-5)
│ │ │ │ │  Row 2   ✅ All empties at end
├─┼─┼─┼─┤           DEFRAGMENTED!
│ │ │ │ │  Row 3
└─┴─┴─┴─┘
```

## Validation Logic

### Completion Check (Frontend)

The task is complete when all blocks are arranged so that **each color forms a contiguous group** in reading order (left-to-right, top-to-bottom):

```typescript
function isDefragmented(): boolean {
  // Flatten grid to reading order
  const sequence: string[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      sequence.push(grid[row][col])
    }
  }

  // Track which colors we've seen
  const colorRanges = new Map<string, { start: number; end: number }>()

  // Find the range (start and end positions) for each color
  sequence.forEach((cell, index) => {
    if (cell !== '') {
      if (!colorRanges.has(cell)) {
        colorRanges.set(cell, { start: index, end: index })
      } else {
        colorRanges.get(cell)!.end = index
      }
    }
  })

  // Check if each color is contiguous
  for (const [color, range] of colorRanges) {
    // Count how many cells of this color exist
    const count = sequence.filter(c => c === color).length
    // Check if the range spans exactly 'count' positions
    const rangeSize = range.end - range.start + 1
    if (rangeSize !== count) {
      return false  // Color is fragmented!
    }
  }

  return true  // All colors are contiguous
}
```

**Valid Grid Examples**:

```
┌─┬─┬─┐
│R│R│R│  Reading: R, R, R, G, G, B, _, _, _
├─┼─┼─┤  ✅ Rs contiguous (0-2)
│G│G│B│     Gs contiguous (3-4)
├─┼─┼─┤     Bs contiguous (5)
│ │ │ │     Empties at end
└─┴─┴─┘
```

```
┌─┬─┬─┐
│B│B│G│  Reading: B, B, G, _, _, _, _, _, _
├─┼─┼─┤  ✅ Bs contiguous (0-1)
│ │ │ │     Gs contiguous (2)
├─┼─┼─┤     Empties at end
│ │ │ │
└─┴─┴─┘
```

**Invalid Grid Examples**:

```
┌─┬─┬─┐
│R│G│R│  Reading: R, G, R, _, _, _, _, _, _
├─┼─┼─┤  ❌ Rs at positions 0 and 2 (separated by G)
│ │ │ │
├─┼─┼─┤
│ │ │ │
└─┴─┴─┘
```

```
┌─┬─┬─┐
│R│R│ │  Reading: R, R, _, G, G, _, B, _, _
├─┼─┼─┤  ❌ Empties scattered (positions 2, 5, 7, 8)
│G│G│ │     Should all be at end
├─┼─┼─┤
│B│ │ │
└─┴─┴─┘
```

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

1. **Plan Color Order**: Decide which color should come first, second, etc.
2. **Work in Reading Order**: Start from top-left, work across and down
3. **Group One Color at a Time**: Focus on getting all of one color together first
4. **Use Empty Spaces**: Swap blocks into empty spots to rearrange without disrupting other colors
5. **Think Ahead**: Moving a block across rows may require multiple swaps

### Example Strategy

```
Goal: Arrange as R, R, G, G, B, B

Initial Grid:
┌─┬─┬─┐
│B│R│G│  Reading: B, R, G, R, G, B
├─┼─┼─┤  Plan: Need to group Rs first, then Gs, then Bs
│R│G│B│
└─┴─┴─┘

Step 1: Get Rs together at start
- Swap (0,0) B with (0,1) R  →  R, B, G, R, G, B
- Swap (0,1) B with (1,0) R  →  R, R, G, B, G, B
Reading: R, R, G, B, G, B  ← Rs contiguous! ✓

Step 2: Get Gs together after Rs
- Already have one G at position 2
- Swap (1,1) G with (1,0) B  →  R, R, G, G, B, B
Reading: R, R, G, G, B, B  ← All colors contiguous! ✓✓✓

Final Grid:
┌─┬─┬─┐
│R│R│G│  Reading: R, R, G, G, B, B
├─┼─┼─┤  ✅ DEFRAGMENTED!
│G│B│B│
└─┴─┴─┘
Total: 3 moves
```

### Advanced Strategy

For larger grids:
1. **Identify Current State**: Count each color and where they are
2. **Choose Target Layout**: Decide color order (any order works, pick easiest)
3. **Create Workspace**: Use bottom-right area as temporary swapping space
4. **Move Systematically**: Place first color, then second, etc.
5. **Optimize Last Moves**: Final color may fall into place without extra moves

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
| Constraint | Linear order | Categorical groups | Contiguous color groups |
| Freedom | Any order during solve | Move anywhere | Any cells can swap |
| Validation | Check final order | Check group membership | Check color contiguity |
| Difficulty | List length | Item count + attributes | Grid size + color count |
| Color Role | None | Visual attribute | Core mechanic |

## Design Rationale

### Why Click-to-Swap?

- **Simple**: Only requires two clicks per move
- **Precise**: Players can carefully plan each swap
- **Mobile-Friendly**: Works well on touch screens
- **Flexible**: Can swap any two cells (not restricted to columns)

### Why Contiguous Color Groups?

- **Color-Driven**: Makes colors central to the puzzle mechanic
- **Clear Objective**: "Group same colors together" is intuitive
- **Flexible Solutions**: Multiple valid arrangements (any color order works)
- **Progressive Challenge**: Easy to start (group one color), harder to optimize
- **Visual Feedback**: Easy to see when a color is fragmented vs grouped
- **Unique**: Different from typical "match-3" or "sort" mechanics

### Why Reading Order (Left-to-Right, Top-to-Bottom)?

- **Familiar**: Like reading text, universally understood
- **Unambiguous**: Clear definition of "before" and "after"
- **Grid-Agnostic**: Works on any grid size
- **Testable**: Easy to validate programmatically

### Why Track Move Count?

- **Skill Expression**: Better players use fewer moves
- **Scoring**: Backend can reward efficiency
- **Feedback**: Players can try to improve their solution
- **Future Feature**: Could show "par" move count for each task

### Comparison to Original Column-Based Design

The contiguous color design offers several advantages:
1. **More Strategic**: Requires planning color order and placement
2. **Color-Centric**: Uses colors as a core mechanic, not just visual decoration
3. **More Interesting**: Grouping colors is more engaging than just "move up"
4. **Better Scaling**: Difficulty increases naturally with more colors/blocks
5. **Unique Identity**: Distinguishes it from other sorting/organizing tasks
