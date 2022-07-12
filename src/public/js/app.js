const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", (msg) => {
  console.log(msg);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server.");
});

socket.addEventListener("error", (msg) => {
  console.log(msg);
});

socket.addEventListener("message", (msg) => {
  const sendMsg = JSON.stringify("Hi");
  console.log(msg);
  socket.send(sendMsg);
  setTimeout(() => {
    socket.send(sendMsg);
  }, 1000);
  // socket.send("hi");
});
