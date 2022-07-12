const ul = document.querySelector("ul");
const form = document.querySelector("form");
const input = form.querySelector("input");

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", (msg) => {
  console.log(msg.type);
});

socket.addEventListener("close", (msg) => {
  console.log(msg.type);
});

socket.addEventListener("error", (msg) => {
  console.log(msg.type);
});

socket.addEventListener("message", (handle) => {
  const data = JSON.parse(handle.data);
  const li = document.createElement("li");
  li.innerText = data;
  ul.prepend(li);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = input.value;
  input.value = "";
  // const li = document.createElement("li");
  // li.innerText = data;
  // ul.prepend(li);
  socket.send(JSON.stringify(data));
});
