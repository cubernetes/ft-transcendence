# Pong AI Implementation

A smoll "AI" (later just _AI_) system that simulates human keyboard input while respecting the 1-second view refresh constraint, creating challenging opponents across three difficulty levels.

## 🎯 Core Philosophy

**Pure Ball Physics Focus**: The AI prioritizes accurate ball trajectory prediction over trying to guess human behavior patterns. It acts as a precision ball-tracking machine that simulates keyboard input just like a human player.

**Human-like Constraints**: Despite being a computer, the AI must follow human-like limitations - it can only "see" the game state once per second for strategic decisions, forcing it to predict and anticipate rather than react instantly.

## 🏗️ Architecture Overview

### Two-Layer Decision System

The AI uses a **hybrid decision-making approach** that respects the 1-second constraint while maintaining competitiveness:

1. **Strategic Layer** (Every 1000ms): Major decision-making

    - Analyzes current game state
    - Predicts ball trajectory with physics simulation
    - Calculates optimal target position
    - Sets strategic goal

2. **Tactical Layer** (Every 30ms): Execution layer
    - Smoothly moves toward strategic target
    - Makes micro-adjustments
    - Simulates keyboard input (`"up"`, `"down"`, `"stop"`)

```
Game State → Strategic Decision (1s) → Target Position
     ↓
Tactical Adjustments (30ms) → Keyboard Simulation → Paddle Movement
```

## ⚙️ Configuration Constants

### Timing Constants

```typescript
const AI_UPDATE_INTERVAL = 1000; // Strategic decisions every 1 second
const TACTICAL_UPDATE_INTERVAL = 30; // Tactical updates every 30ms
```

### Difficulty Levels

| Difficulty | Prediction Depth | Reaction Speed | Accuracy | Reaction Time |
| ---------- | ---------------- | -------------- | -------- | ------------- |
| **EASY**   | 8 bounces        | 0.7x           | 90%      | 20-170ms      |
| **MEDIUM** | 20 bounces       | 0.95x          | 98%      | 10-60ms       |
| **HARD**   | 30 bounces       | 0.99x          | 99.5%    | 5-25ms        |

#### What These Mean:

- **Prediction Depth**: How many wall bounces the AI can calculate ahead
- **Reaction Speed**: Multiplier for how quickly AI responds (1.0 = instant)
- **Accuracy**: How precise the positioning is (less randomness = higher accuracy)
- **Reaction Time**: Total delay from decision to keyboard input

## 🧠 Core Algorithms

### 1. Ball Trajectory Prediction

The AI simulates ball physics to predict where the ball will be when it reaches the paddle:

```typescript
// Simulate ball movement frame by frame
while (steps < maxSteps && bounceCount < maxDepth) {
    // Move ball exactly like the real game
    simBall.pos.x += simBall.vec.x;
    simBall.pos.z += simBall.vec.z;

    // Handle wall bounces
    if (Math.abs(simBall.pos.z) > wallLimit) {
        simBall.vec.z *= -1; // Reverse Z direction
        bounceCount++;
    }
}
```

**Why This Works**: By using the exact same physics as the game engine, predictions are highly accurate even through multiple wall bounces.

### 2. Strategic Target Calculation

**When Ball Coming Toward AI**:

- Predict exact interception point using physics simulation
- Add minimal strategic offset for better angle control (HARD mode only)

**When Ball Moving Away**:

- Calculate future ball trajectory
- Position optimally for the expected return shot
- Stay closer to center for better coverage

### 3. Keyboard Input Simulation

The AI translates its calculated target position into keyboard commands:

```typescript
// Calculate where paddle needs to move
const difference = targetPosition - currentPaddlePosition;
const threshold = paddle.speed * precisionMultiplier;

// Simulate keyboard press
if (Math.abs(difference) > threshold) {
    const keyPress = difference > 0 ? "up" : "down";
    engine.setInput(playerIndex, keyPress); // Same as human pressing key
} else {
    engine.setInput(playerIndex, "stop"); // Release keys
}
```

## 🎮 Difficulty Scaling Philosophy

### EASY Mode: "A fool"

- There is some prediction
- Reasonable reaction times
- Occasional "hesitations"
- Wide movement tolerance

### MEDIUM Mode: "Still dumb but better"

- Better prediction capabilities
- Faster reactions
- Minimal positioning errors
- Tight movement precision
- **No hesitation**

### HARD Mode: "Best possible"

- Deep prediction (30 bounces ahead)
- Reaction times.. fast
- Better precision movement
- **No hesitation**

## 🔧 Key Implementation Details

### Respecting the 1-Second Constraint

The AI interprets "refresh view once per second" as:

- ✅ **Strategic analysis** only happens every 1000ms
- ✅ **Ball trajectory calculation** only happens every 1000ms
- ✅ **Target position setting** only happens every 1000ms
- ❌ But **smooth movement execution** can happen more frequently

### Reaction Delay System

```typescript
const baseDelay = difficulty === "HARD" ? 5 : difficulty === "MEDIUM" ? 10 : 20;
const variableDelay = (1 - reactionSpeedMultiplier) * maxAdditionalDelay;
const totalDelay = baseDelay + variableDelay;
```

**HARD**: 5-25ms total delay (least dumb possible)

**MEDIUM**: 10-60ms total delay (pretty dumb)

**EASY**: 20-170ms total delay (dumb)

### Movement Precision Thresholds

The AI uses different precision levels for when to stop moving:

- **HARD**: 0.1× paddle speed (kinda precise)
- **MEDIUM**: 0.3× paddle speed (okayish precise)
- **EASY**: 0.8× paddle speed (not precise)

## 📊 Performance Characteristics

### Prediction Accuracy

- **600 simulation steps** for HARD mode
- **500 simulation steps** for MEDIUM mode
- **250 simulation steps** for EASY mode

Higher steps = more accurate long-term predictions through multiple bounces.

### Confidence System

The AI tracks how confident it is in its predictions:

- **99.5% confidence retention** per bounce (HARD)
- **99% confidence retention** per bounce (MEDIUM)
- **92% confidence retention** per bounce (EASY)

Lower confidence = slightly less precise positioning.

## 🚀 Future Improvements

Potential enhancements while maintaining current architecture:

- **Finetuning**: Continue with variables experimentation
- **Dynamic difficulty**: Adjust based on player performance
- **Spin prediction**: Account for paddle collision angles
- **Energy management**: Simulate "fatigue" for longer games
