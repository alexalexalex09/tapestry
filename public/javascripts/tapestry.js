const socket = io();
function setupCanvas() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX, lastY;
  let gradient = 1;
  let gradients = [];

  // Define gradients

  gradients[1] = {};
  gradients[1].start = "6AB3B8";
  gradients[1].stop = "4B778D";

  gradients[2] = {};
  gradients[2].start = "1D2D44";
  gradients[2].stop = "2E5468";

  gradients[3] = {};
  gradients[3].start = "395C6B";
  gradients[3].stop = "668C8C";

  gradients[4] = {};
  gradients[4].start = "B5B2C2";
  gradients[4].stop = "B5C5D1";

  gradients[5] = {};
  gradients[5].start = "9E9AA2";
  gradients[5].stop = "5B6E7D";

  gradients[6] = {};
  gradients[6].start = "1F3134";
  gradients[6].stop = "1B262C";

  gradients[7] = {};
  gradients[7].start = "213640";
  gradients[7].stop = "3E5C5D";

  gradients[8] = {};
  gradients[8].start = "5B6F5C";
  gradients[8].stop = "A7C5BD";

  // Get the selected gradient from the radio buttons

  const radios = document.querySelectorAll("input[type=radio]");

  for (const radio of radios) {
    radio.addEventListener("change", (event) => {
      console.log(event.target.value);
      if (event.target.checked) {
        gradient = event.target.value.substr(8);
      }
    });
  }

  //Draw when receiving data
  socket.on("data", (data) => {
    draw(data.x, data.y, data.color);
  });

  function draw(x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 50;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.quadraticCurveTo(lastX, lastY, (lastX + x) / 2, (lastY + y) / 2);
    ctx.stroke();
    lastX = x;
    lastY = y;
  }

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      const colorToDraw = getRandomColorBetween(
        gradients[gradient].start,
        gradients[gradient].stop
      );
      const data = {
        x: e.offsetX,
        y: e.offsetY,
        color: colorToDraw,
      };
      socket.emit("data", data);
      draw(e.offsetX, e.offsetY, colorToDraw);
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  socket.on("pixels", (pixels) => {
    pixels.forEach(({ x, y, color }) => {
      draw(x, y, color);
    });
  });

  socket.emit("getPixels");
}

document.addEventListener("DOMContentLoaded", setupCanvas);

function getRandomColorBetween(hexColor1, hexColor2) {
  // Convert hex strings to RGB arrays
  const rgb1 = hexToRgb(hexColor1);
  const rgb2 = hexToRgb(hexColor2);

  // Generate a random number between 0 and 1
  const rand = Math.random();

  // Interpolate between the two RGB values
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * rand);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * rand);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * rand);

  // Convert the RGB values back to a hex string
  return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  const hexR = r.toString(16).padStart(2, "0");
  const hexG = g.toString(16).padStart(2, "0");
  const hexB = b.toString(16).padStart(2, "0");
  return `#${hexR}${hexG}${hexB}`;
}
