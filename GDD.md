# Game Design Document: TaskMan

**Version:** 1.0
**Date:** November 4, 2025
**Status:** Prototype Design

---

## 1. Executive Summary

**TaskMan** is a web-based multiplayer task completion game that provides satisfying entropy-reduction gameplay through simple micro-tasks. Players complete tasks to earn tokens, which they can use to offer tasks to other players. The game uses only native UI controls and progressively unlocks more complex composite task creation, all themed around the concept of sub-agents in a distributed AI system.

### Core Experience
Players experience the small satisfactions of organizing, sorting, and cleaning up digital environments, similar to titles like PowerWash Simulator or the mini-games in Among Us, while participating in an emergent token-based economy.

---

## 2. Game Overview

### 2.1 Concept
A minimalist task-completion game where players:
- Complete entropy-reducing micro-tasks
- Earn tokens for successful completion
- Offer tasks to other players in exchange for tokens
- Progress from simple to composite task management

### 2.2 Target Audience
- Casual gamers who enjoy puzzle and organizational games
- Players seeking low-stress, satisfying gameplay
- Mobile and web game players (15-45 age range)
- Fans of incremental/idle games and emergent economies

### 2.3 Unique Selling Points
- **Pure UI Controls**: No virtual joysticks or complex controls—uses native sliders, dropdowns, and buttons
- **Emergent Economy**: Player-driven task marketplace
- **Compositional Depth**: Simple tasks compose into complex workflows
- **Cross-Platform Web**: Accessible on any device with a browser
- **Satisfaction-Focused**: Every interaction reduces entropy and feels rewarding

### 2.4 Theme & Presentation
The game operates under a subtle thematic framework: players are sub-agents in a large agentic AI system, breaking down high-level tasks into executable operations. This theme informs the:
- Visual design (clean, systematic, computational aesthetic)
- Task terminology (tasks, sub-tasks, agents)
- UI patterns (hierarchical task trees, token flow visualization)

**Important**: This theme is NOT overtly presented through narrative or lore. It's a structural metaphor that guides design decisions while remaining invisible to players focused on gameplay.

---

## 3. Core Gameplay Loop

### 3.1 Basic Loop (Early Game)
1. **Receive Task** from tutorial or task board
2. **Complete Task** using native UI controls (sort list, match color, etc.)
3. **Earn Tokens** based on task difficulty
4. **Repeat** with increasing complexity

### 3.2 Advanced Loop (Mid-to-Late Game)
1. **Accept Composite Task** from task board
2. **Decompose** task into sub-tasks
3. **Assign Sub-tasks** to task board for other players
4. **Monitor Completion** of assigned sub-tasks
5. **Submit Composite Task** when all sub-tasks complete
6. **Earn Premium** (tokens greater than sum of sub-task costs)

### 3.3 Economic Loop
1. **Earn tokens** through task completion
2. **Spend tokens** to offer tasks to others
3. **Earn premium** by efficiently managing composite tasks
4. **Reinvest** in more complex task opportunities

---

## 4. Task System Design

### 4.1 Task Categories

#### 4.1.1 Atomic Tasks (Single Player)
Tasks that one player completes in a single session.

**Simple Tasks** (Low Difficulty, Low Tokens)
- **Sort List**: Arrange items alphabetically, numerically, or by custom criteria
  - Example: Sort 10 names alphabetically
  - UI: Drag-and-drop list or swap buttons
  - Time: 15-30 seconds
  - Reward: 5-10 tokens

- **Group Separation**: Categorize objects by attributes
  - Example: Separate shapes into circles, squares, triangles
  - UI: Drag items into labeled buckets
  - Time: 20-45 seconds
  - Reward: 8-15 tokens

- **Color Matching**: Match a target color using RGB sliders
  - Example: Match #FF5733 within 5% accuracy
  - UI: Three sliders (R, G, B) with live preview
  - Time: 30-60 seconds
  - Reward: 10-20 tokens

- **Arithmetic Calculation**: Solve basic math problems
  - Example: Calculate: (45 × 3) + 127 - 89
  - UI: Number input field
  - Time: 10-30 seconds
  - Reward: 5-12 tokens

- **Defragmentation**: Group same-colored blocks contiguously
  - Example: Arrange grid so each color forms a contiguous group when read left-to-right, top-to-bottom
  - UI: Click-to-swap grid (any two cells can swap)
  - Mechanic: Colors must be contiguous in reading order (like defragmenting files on disk)
  - Time: 60-120 seconds
  - Reward: 15-30 tokens
  - See DEFRAG_TASK_DESIGN.md for detailed mechanic explanation

**Hard Tasks** (High Difficulty, High Tokens)
- **Pattern Recognition**: Identify sequences or anomalies
- **Logic Puzzles**: Multi-step reasoning challenges
- **Optimization Problems**: Achieve specific goals with constraints
- Time: 2-5 minutes
- Reward: 50-150 tokens

#### 4.1.2 Composite Tasks (Multi-Player Coordination)
Tasks composed of multiple atomic or other composite tasks.

**Structure**:
- Created by players who have unlocked the composite task feature
- Consist of 2-10 sub-tasks
- Require all sub-tasks to be completed before composite task can be submitted
- Award tokens greater than the sum of sub-task costs (incentivizing efficient decomposition)

**Decomposition Mechanics**:
- Player receives a high-level task description (e.g., "Organize customer database")
- Player must choose appropriate sub-tasks from available task types
- **Correctness Validation**: Incorrect sub-task choices result in task failure
  - Example: Choosing "Color Match" for a data organization task would fail validation
  - System provides hints or categories to guide decomposition
  - Learning curve: players improve decomposition skills over time

**Example Composite Task**:
- **Task**: "Process Sales Report"
- **Valid Decomposition**:
  1. Sort sales data by region (Sort List)
  2. Calculate total revenue (Arithmetic)
  3. Group top performers (Group Separation)
- **Invalid Decomposition**:
  1. Match color scheme (Color Match) ❌ Not relevant
  2. Defragment data (Defrag) ❌ Wrong tool

### 4.2 Task Properties

Every task includes:
- **ID**: Unique identifier
- **Type**: Simple, Hard, or Composite
- **Description**: What the task requires
- **Token Reward**: Amount earned on completion
- **Creator**: Player who offered the task (or "System" for tutorial tasks)
- **Difficulty Rating**: Visual indicator (1-5 stars)
- **Estimated Time**: Approximate completion time
- **Expiration Time**: Automatic time limit after acceptance (see 4.3)
- **Validation Criteria**: Automated checks for correctness

### 4.3 Task Expiration System

To prevent tasks from being locked indefinitely and maintain a healthy task economy, accepted tasks automatically expire if not completed within a calculated time limit.

**Expiration Formula:**
```
expirationTime = estimatedTime × 3 × difficultyMultiplier × taskTypeMultiplier
Minimum: 2 minutes
Maximum: 60 minutes

difficultyMultiplier = 1.0 + (difficulty - 1) × 0.2
taskTypeMultiplier:
  - sort_list: 1.0x (straightforward)
  - arithmetic: 1.0x (quick calculation)
  - color_match: 1.2x (fine-tuning required)
  - group_separation: 1.3x (categorization thinking)
  - defragmentation: 1.5x (complex spatial reasoning)
```

**Behavior:**
- **On Task Acceptance**: Expiration timer starts immediately
- **During Task**: Frontend displays countdown timer to create urgency
- **On Expiration**: Task automatically returns to available pool for other players
- **On Late Submission**: Submissions after expiration are rejected
- **Cleanup**: System checks for expired tasks every minute and releases them

**Example Calculations:**
- Sort List (Difficulty 1, 30s estimated): 1.5 minutes
- Color Match (Difficulty 3, 45s estimated): 3.8 minutes
- Defragmentation (Difficulty 5, 300s estimated): 40.5 minutes

**Design Rationale:**
- Prevents hoarding of high-reward tasks
- Creates time pressure and excitement
- Ensures task board remains dynamic
- Scales fairly with task complexity
- Penalizes task type complexity, not just difficulty

---

## 5. Progression System

### 5.1 Tutorial Phase (First 5-10 Tasks)
**Objective**: Teach core mechanics and task types

- Players complete **system-generated tutorial tasks**
- Each task introduces a different task type (Sort, Group, Color Match, etc.)
- Rewards are slightly higher to encourage engagement
- No token cost—all tasks are free
- Guided tooltips explain UI and feedback

**Unlock Condition**: Complete 5 tutorial tasks successfully

### 5.2 Task Board Access (Early Game)
**Objective**: Participate in the player economy

- **Unlocked**: After completing tutorial
- Access to **Task Board**: central marketplace of player-offered tasks
- Can **accept tasks** from other players in exchange for token rewards
- Can **offer simple tasks** to other players (costs tokens)
- Limited to atomic tasks (simple and hard)

**Unlock Condition**: Complete 25 total tasks and earn 500 tokens

### 5.3 Composite Task Creation (Mid-Late Game)
**Objective**: Manage complex workflows

- **Unlocked**: After significant task board participation
- Can **accept composite tasks** from other players
- Can **create and decompose** composite tasks
- Must learn which sub-tasks are valid for different composite task types
- Earns premium tokens for efficient task management

---

## 6. Economy & Token System

### 6.1 Token Mechanics
**Tokens** are the universal currency for:
- Task rewards
- Offering tasks to others
- Unlocking cosmetic features (future)

**Earning Tokens**:
- Complete atomic tasks: 5-150 tokens
- Complete composite tasks: 50-500 tokens
- Premium from task management: 10-30% above sub-task costs

**Spending Tokens**:
- Offer tasks to task board (cost = reward + listing fee)
- Example: Offering a 10-token Sort task costs 12 tokens (10 reward + 2 fee)

### 6.2 Economic Balance

**Token Faucets** (Sources):
- Tutorial tasks (one-time)
- System-generated daily quests
- Composite task premiums
- Completing tasks from other players

**Token Sinks** (Drains):
- Listing fees for offering tasks
- Failed task penalties (small, 10% of reward)
- Future: Cosmetic purchases, profile customization

**Design Goals**:
- **Positive sum economy**: More tokens enter than leave
- **Encourage circulation**: Listing fees should be low enough to encourage task offering
- **Reward skill**: Better decomposition earns better premiums
- **Prevent hoarding**: Regular new task opportunities incentivize spending

### 6.3 Pricing Guidelines

| Task Type | Time Estimate | Token Reward Range |
|-----------|---------------|-------------------|
| Simple Sort | 15-30s | 5-10 |
| Group Separation | 20-45s | 8-15 |
| Color Match | 30-60s | 10-20 |
| Arithmetic | 10-30s | 5-12 |
| Defragmentation | 60-120s | 15-30 |
| Hard Puzzle | 2-5min | 50-150 |
| Composite (2-4 sub-tasks) | 3-8min | 80-250 |
| Composite (5-10 sub-tasks) | 10-20min | 300-600 |

**Token-to-Time Ratio**: Approximately 5-10 tokens per minute of effort

---

## 7. User Interface & Experience

### 7.1 UI Principles
1. **Native Controls Only**: Sliders, buttons, dropdowns, drag-and-drop (HTML5)
2. **Mobile-First**: Touch-friendly, responsive design
3. **Instant Feedback**: Visual and haptic responses to all interactions
4. **Clear Hierarchy**: Task lists, boards, and details are easy to navigate
5. **Minimal Text**: Icons and visual indicators over lengthy descriptions
6. **Accessibility**: High contrast, screen reader support, keyboard navigation

### 7.2 Core Screens

#### 7.2.1 Home/Dashboard
- **Token Balance**: Prominent display of current tokens
- **Active Tasks**: Current task in progress (if any)
- **Quick Actions**: "Browse Tasks", "My Tasks", "Create Task"
- **Progression**: Visual indicator of unlocks and achievements

#### 7.2.2 Task Board
- **Filter/Sort Controls**: By type, reward, difficulty, time estimate
- **Task Cards**: Show type, reward, difficulty, time, creator
- **Accept Button**: Clear call-to-action
- **Search**: Find specific task types or rewards

#### 7.2.3 Task Execution Screen
- **Task Description**: Clear, concise instructions
- **Interactive Controls**: Native UI elements for the specific task type
- **Progress Indicator**: For multi-step tasks
- **Submit Button**: Validates and completes task
- **Timer** (optional): For timed challenges

#### 7.2.4 Composite Task Creator
- **High-Level Description**: Shows the composite task goal
- **Sub-Task Palette**: Available task types to choose from
- **Composition Area**: Drag tasks here to build workflow
- **Validation Preview**: Shows if decomposition is valid
- **Pricing Calculator**: Estimates cost and potential premium

### 7.3 Feedback Systems

#### Success Feedback
- **Visual**: Green checkmark, smooth animation
- **Haptic**: Light vibration (mobile)
- **Audio**: Satisfying "click" or "ding" sound
- **Token Animation**: Tokens fly into balance counter

#### Failure Feedback
- **Visual**: Red indicator, shake animation
- **Haptic**: Double tap vibration
- **Audio**: Gentle error sound (not punitive)
- **Help Text**: Explains what went wrong

#### Progress Feedback
- **Task Completion Bar**: Shows overall progress
- **Streak Counter**: Consecutive successful tasks
- **Daily Goals**: Progress toward daily token targets

---

## 8. Multiplayer & Social Features

### 8.1 Real-Time Task Board
- Tasks appear and disappear as players offer and accept them
- **Concurrency**: Multiple players can see the same task, first to accept wins
- **Refresh Rate**: WebSocket updates for instant board changes
- **Ghost Tasks**: Recently completed tasks fade out to show activity

### 8.2 Player Interactions
- **Indirect**: No chat, profiles, or direct communication
- **Reputation** (future): Rating system for task creators (quality of composite task decomposition)
- **Task History**: See which players offered high-quality tasks
- **Favorite Creators** (future): Follow players who offer good tasks

### 8.3 Collaborative Elements
- **Task Chains**: Completing a sub-task contributes to someone's composite task
- **Emergent Roles**: Some players specialize in simple tasks, others in composite management
- **Economic Signals**: Popular task types command higher rewards

---

## 9. Progression & Retention

### 9.1 Short-Term Goals (Session)
- Complete daily quests
- Earn X tokens today
- Try a new task type
- Complete a composite task

### 9.2 Medium-Term Goals (Week)
- Unlock composite task creation
- Earn 1,000 total tokens
- Complete 100 tasks
- Master all task types (achievement)

### 9.3 Long-Term Goals (Month+)
- Build efficient task management strategies
- Create popular composite tasks
- Top leaderboards (future)
- Collect rare achievements

### 9.4 Retention Mechanics
- **Daily Login Rewards**: Bonus tokens
- **Streak Bonuses**: Consecutive days increase rewards
- **Limited-Time Events**: Special high-reward tasks
- **Seasonal Content**: New task types introduced periodically

---

## 10. Scope for Prototype

### 10.1 Must-Have Features (MVP)
✅ **Core Task Types**:
- Sort List
- Group Separation
- Color Match
- Arithmetic
- Defragmentation (simple version)

✅ **Tutorial System**:
- 5 guided tasks introducing each task type
- Basic tooltips and instructions

✅ **Task Board**:
- View available tasks
- Accept and complete tasks
- Offer simple tasks to board

✅ **Token System**:
- Earn tokens from completion
- Spend tokens to offer tasks
- Display balance

✅ **Basic Progression**:
- Tutorial → Task Board unlock
- Track task completion count

✅ **Multiplayer**:
- Real-time task board updates
- Multi-player task offering/acceptance

### 10.2 Should-Have Features (Prototype+)
🔶 **Composite Tasks**:
- Accept composite tasks
- Create and decompose composite tasks
- Basic validation for sub-task correctness

🔶 **Hard Tasks**:
- 2-3 puzzle/logic task types

🔶 **Enhanced Feedback**:
- Animations for task completion
- Sound effects

### 10.3 Nice-to-Have Features (Post-Prototype)
⭐ User profiles and history
⭐ Leaderboards and achievements
⭐ Daily quests and events
⭐ Reputation system
⭐ Mobile app (PWA or native)
⭐ Cosmetic customization
⭐ Social features (following, favorites)

---

## 11. Success Metrics

### 11.1 Gameplay Metrics
- **Task Completion Rate**: % of accepted tasks completed successfully
- **Average Session Length**: Time spent per visit
- **Tasks Per Session**: Number of tasks completed per visit
- **Token Velocity**: Rate of token earning and spending

### 11.2 Engagement Metrics
- **Daily Active Users (DAU)**
- **Retention**: % of users returning after 1, 7, 30 days
- **Task Board Activity**: Number of player-offered tasks
- **Composite Task Success Rate**: % of valid decompositions

### 11.3 Economy Metrics
- **Token Inflation/Deflation**: Total tokens in system over time
- **Task Offering Rate**: Player tasks vs. system tasks
- **Average Task Price**: Tokens per task over time
- **Premium Earnings**: Average premium from composite tasks

---

## 12. Risks & Mitigations

### 12.1 Risk: Players Don't Offer Tasks
**Mitigation**:
- Ensure system-generated tasks always available
- Offer incentives (achievements) for task creation
- Make offering tasks simple and rewarding

### 12.2 Risk: Economy Becomes Unbalanced
**Mitigation**:
- Monitor token metrics closely
- Implement dynamic pricing adjustments
- Introduce token sinks as needed

### 12.3 Risk: Composite Task Validation Too Complex
**Mitigation**:
- Start with highly constrained task types
- Provide clear feedback and hints
- Iterate based on player data

### 12.4 Risk: Tasks Become Repetitive/Boring
**Mitigation**:
- Regular content updates (new task types)
- Procedural generation for task variety
- Limited-time special events

### 12.5 Risk: Low Player Population at Launch
**Mitigation**:
- Bot-generated tasks to simulate economy
- Single-player mode that unlocks multiplayer later
- Incentivize inviting friends

---

## 13. Future Expansion Ideas

### 13.1 New Task Types
- Data entry and validation
- Image recognition and tagging
- Text proofreading and editing
- Code debugging challenges
- Music rhythm matching

### 13.2 Metagame Elements
- Task creation contests
- Guild/team systems for composite tasks
- Seasonal leaderboards
- Special event tasks

### 13.3 Monetization (If Needed)
- **Premium Pass**: Bonus token earning rate, cosmetic unlocks
- **Cosmetics**: Profile themes, task completion animations
- **Task Slots**: Free users limited to 3 simultaneous tasks, premium unlimited
- **No Pay-to-Win**: Tokens cannot be purchased directly

### 13.4 Platform Expansion
- Mobile apps (iOS/Android)
- Desktop app (Electron)
- API for third-party task creation

---

## 14. Conclusion

TaskMan offers a unique blend of satisfying micro-task gameplay, emergent economic simulation, and compositional depth. By focusing on native UI controls, clear feedback, and a player-driven task economy, the game appeals to casual players while providing depth for engaged users. The prototype will validate core mechanics and multiplayer economy, setting the stage for expanded content and features.

**Next Steps**:
1. Review and refine this GDD with stakeholders
2. Create Technical Design Document for implementation
3. Build prototype with core features
4. Conduct playtesting and iterate
5. Plan post-prototype roadmap based on feedback
