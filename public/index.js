const socket = io();

const upButton = document.getElementById("up");
const downButton = document.getElementById("down");
const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

upButton.addEventListener("click", () => {
  socket.emit("up");
});

downButton.addEventListener("click", () => {
  socket.emit("down");
});

leftButton.addEventListener("click", () => {
  socket.emit("left");
});

rightButton.addEventListener("click", () => {
  socket.emit("right");
});

const playerEl = document.getElementById("player");
const foodEl = document.getElementById("food");

socket.on("player", (player) => {
  playerEl.style.left = player.left + "px";
  playerEl.style.top = player.top + "px";
});

socket.on("food", (food) => {
  foodEl.style.left = food.left + "px";
  foodEl.style.top = food.top + "px";
});
