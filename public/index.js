const socket = io();

const pingButton = document.getElementById("ping");

pingButton.addEventListener("click", () => {
  socket.emit("ping");
});

socket.on("pong", (message) => {
  console.log("pong", message);
});
