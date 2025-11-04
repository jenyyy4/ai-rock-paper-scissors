const videoElement = document.querySelector(".input");
const canvasElement = document.querySelector(".output");
const canvasCtx = canvasElement.getContext("2d");
const resultText = document.getElementById("resultText");

function guessGesture(landmarks) {
  if (!landmarks) return "unknown";

  const tips = [8, 12, 16, 20];
  const pip = [6, 10, 14, 18];
  const fingers = tips.map((tip, i) =>
    landmarks[tip].y < landmarks[pip[i]].y ? 1 : 0
  );

  const sum = fingers.reduce((a, b) => a + b, 0);

  if (sum === 0) return "rock";
  if (fingers[0] && fingers[1] && !fingers[2] && !fingers[3]) return "scissors";
  if (sum === 4) return "paper";
  return "thats not a move-";
}

function getWinningMove(playerMove) {
  const winMap = { rock: "paper", paper: "scissors", scissors: "rock" };
  return winMap[playerMove] || "you issue";
}

const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 3,
    });
    drawLandmarks(canvasCtx, landmarks, {
      color: "#FF0000",
      lineWidth: 2,
    });

    const move = guessGesture(landmarks);
    const aiMove = getWinningMove(move);
    resultText.innerText = `You: ${move} ☆ AI: ${aiMove}`;
  } else {
    resultText.innerText = "Choose your move ☆";
  }

  canvasCtx.restore();
});

const cam = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
cam.start();
