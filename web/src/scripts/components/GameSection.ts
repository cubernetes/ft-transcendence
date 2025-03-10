import { Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder, CreateText, Mesh } from 'babylonjs'
import earcut from 'earcut';

(window as any).earcut = earcut;

// Game constants
const PADDLE_WIDTH = 0.2;
const PADDLE_HEIGHT = 0.3;
const PADDLE_DEPTH = 5;
const PADDLE_SPEED = 0.3;
const BALL_RADIUS = 0.3;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 0.1;
const BOARD_DEPTH = 15;
const BALL_SPEED = 0.2;
const SCORE_POSITION = new Vector3(0, 0, 8);

// Game state
let score = { player1: 0, player2: 0 };
let scoreText: Mesh;
let ball: Mesh;
let paddle1: Mesh;
let paddle2: Mesh;
let ballDirection = new Vector3(BALL_SPEED, 0, BALL_SPEED);
let keysPressed: { [key: string]: boolean } = {};
let fontData: any = null;

export async function createGameSection(): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.className = "w-full h-[600px] relative"; // Set explicit height
  
  const gameSection = document.createElement('canvas');
  gameSection.className = "w-full h-full";
  gameSection.id = "renderCanvas"; // Add an ID for easier reference
  
  container.appendChild(gameSection);
  
  // Wait for the canvas to be added to the DOM before initializing Babylon
  setTimeout(() => {
    const engine = new Engine(gameSection);
    
    const createScene = async function() {
      const scene = new Scene(engine);
      
      scene.createDefaultLight();
      setCamera(scene);
      createGameObjects(scene);
      await addScore(scene);
      setupKeyboardControls(scene);
      
      scene.onBeforeRenderObservable.add(() => {
        updateGame(scene);
      });
      
      return scene;
    };
    
    createScene().then(scene => {
      engine.runRenderLoop(() => {
        scene.render();
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        engine.resize();
      });
    });
  }, 0);
  
  return container;
}

function setCamera(scene: Scene): ArcRotateCamera {
  const camera = new ArcRotateCamera(
      "pongCamera",
      -Math.PI / 2,           // alpha - side view (fixed)
      0,        // beta - slightly above (fixed)
      25,                   // radius - distance from center
      Vector3.Zero(),// target - looking at center
      scene
  );
  camera.lowerRadiusLimit = 10;
  camera.upperRadiusLimit = 30;
  
  // Disable keyboard controls
  camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
  
  // Keep only mouse wheel zoom
  camera.inputs.clear();
  camera.inputs.addMouseWheel();
  
  return camera;
}

function createGameObjects(scene: Scene) {
  // Create game board
  const board = MeshBuilder.CreateBox("board", {
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      depth: BOARD_DEPTH
  }, scene);
  board.position.y = -0.5;
  
  // Create paddles
  paddle1 = MeshBuilder.CreateBox("paddle1", {
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      depth: PADDLE_DEPTH
  }, scene);
  paddle1.position = new Vector3(-BOARD_WIDTH/2 + 0.5, 0.5, 0);
  paddle1.rotation.x = Math.PI;
  
  paddle2 = MeshBuilder.CreateBox("paddle2", {
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      depth: PADDLE_DEPTH
  }, scene);
  paddle2.position = new Vector3(BOARD_WIDTH/2 - 0.5, 0.5, 0);
  paddle2.rotation.x = Math.PI;
  
  // Create ball
  ball = MeshBuilder.CreateSphere("ball", {
      diameter: BALL_RADIUS * 2
  }, scene);
  ball.position = new Vector3(0, 0.5, 0);
}

async function addScore(scene: Scene) {
  // Load font data once and cache it
  fontData = await((await fetch('assets/Montserrat_Regular.json')).json());
  
  // Create initial score text
  const text = CreateText(
      "scoreText",
      `Score: ${score.player1} - ${score.player2}`,
      fontData,
      {
          size: 0.5,    // text size
          depth: 0.1,   // extrusion depth
          resolution: 32 // curve resolution
      }
  );
  
  if (!text) throw new Error("Failed to create score text");
  scoreText = text;
  scoreText.position = SCORE_POSITION;
  scoreText.rotation.x = Math.PI / 2;
}

function setupKeyboardControls(scene: Scene) {
  // Setup keyboard event listeners
  window.addEventListener("keydown", (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
      }
      keysPressed[event.key] = true;
  });
  window.addEventListener("keyup", (event) => {
      keysPressed[event.key] = false;
  });
}

function updateGame(scene: Scene) {
  // Handle paddle movement
  if (keysPressed["w"]) {
      paddle1.position.z += PADDLE_SPEED;
      if (paddle1.position.z > BOARD_DEPTH/2 - PADDLE_DEPTH/2) {
          paddle1.position.z = BOARD_DEPTH/2 - PADDLE_DEPTH/2;
      }
  }
  
  if (keysPressed["s"]) {
      paddle1.position.z -= PADDLE_SPEED;
      if (paddle1.position.z < -BOARD_DEPTH/2 + PADDLE_DEPTH/2) {
          paddle1.position.z = -BOARD_DEPTH/2 + PADDLE_DEPTH/2;
      }
  }
  
  if (keysPressed["ArrowUp"]) {
      paddle2.position.z += PADDLE_SPEED;
      if (paddle2.position.z > BOARD_DEPTH/2 - PADDLE_DEPTH/2) {
          paddle2.position.z = BOARD_DEPTH/2 - PADDLE_DEPTH/2;
      }
  }
  
  if (keysPressed["ArrowDown"]) {
      paddle2.position.z -= PADDLE_SPEED;
      if (paddle2.position.z < -BOARD_DEPTH/2 + PADDLE_DEPTH/2) {
          paddle2.position.z = -BOARD_DEPTH/2 + PADDLE_DEPTH/2;
      }
  }
  
  // Update ball position
  ball.position.x += ballDirection.x;
  ball.position.z += ballDirection.z;
  
  // Ball collision with paddles
  if (ball.position.x <= paddle1.position.x + PADDLE_WIDTH/2 + BALL_RADIUS && 
      ball.position.x >= paddle1.position.x &&
      ball.position.z <= paddle1.position.z + PADDLE_DEPTH/2 + BALL_RADIUS &&
      ball.position.z >= paddle1.position.z - PADDLE_DEPTH/2 - BALL_RADIUS) {
      ballDirection.x = Math.abs(ballDirection.x); // Reverse x direction
  }
  
  if (ball.position.x >= paddle2.position.x - PADDLE_WIDTH/2 - BALL_RADIUS && 
      ball.position.x <= paddle2.position.x &&
      ball.position.z <= paddle2.position.z + PADDLE_DEPTH/2 + BALL_RADIUS &&
      ball.position.z >= paddle2.position.z - PADDLE_DEPTH/2 - BALL_RADIUS) {
      ballDirection.x = -Math.abs(ballDirection.x); // Reverse x direction
  }
  
  // Ball collision with top and bottom walls
  if (ball.position.z >= BOARD_DEPTH/2 - BALL_RADIUS || 
      ball.position.z <= -BOARD_DEPTH/2 + BALL_RADIUS) {
      ballDirection.z = -ballDirection.z; // Reverse z direction
  }
  
  // Ball out of bounds (scoring)
  if (ball.position.x < -BOARD_WIDTH/2) {
      // Player 2 scores
      score.player2++;
      resetBall();
      updateScoreDisplay();
  } else if (ball.position.x > BOARD_WIDTH/2) {
      // Player 1 scores
      score.player1++;
      resetBall();
      updateScoreDisplay();
  }
}

function resetBall() {
  ball.position = new Vector3(0, 0.5, 0);
  
  // Randomize ball direction
  const randomAngle = Math.random() * Math.PI * 2;
  ballDirection.x = BALL_SPEED * Math.cos(randomAngle);
  ballDirection.z = BALL_SPEED * Math.sin(randomAngle);
  
  // Ensure the ball moves toward one of the players
  if (Math.abs(ballDirection.x) < 0.3 * BALL_SPEED) {
      ballDirection.x = ballDirection.x > 0 ? 0.3 * BALL_SPEED : -0.3 * BALL_SPEED;
  }
}

async function updateScoreDisplay() {
  // Instead of recreating the text mesh, we'll just update the existing one
  if (scoreText) {
      // Remove the old score text
      scoreText.dispose();
      
      // Create new text with updated score
      const text = CreateText(
          "scoreText",
          `Score: ${score.player1} - ${score.player2}`,
          fontData, // Use the cached font data
          {
              size: 0.5,
              depth: 0.1,
              resolution: 32
          }
      );
      
      if (!text) throw new Error("Failed to create score text");
      scoreText = text;
      scoreText.position = SCORE_POSITION;
      scoreText.rotation.x = Math.PI / 2;
  }
}
