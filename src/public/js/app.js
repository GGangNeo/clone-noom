const UL = document.querySelector("ul");
const FORM_NICKNAME = document.getElementById("nickname");
const FORM_MESSAGE = document.getElementById("message");
const NICK_INPUT = FORM_NICKNAME.querySelector("input");
const FORM_INPUT = FORM_MESSAGE.querySelector("input");

let nickname = "unknown";

function makeMessage(nickname, message) {
  const msg = { nickname, message };
  return JSON.stringify(msg);
}

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
  console.log(data);
  const li = document.createElement("li");
  li.innerText = `${data.nickname} : ${data.message}`;
  UL.prepend(li);
});

FORM_MESSAGE.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = FORM_INPUT.value;
  FORM_INPUT.value = "";
  socket.send(makeMessage(nickname, data));
});

FORM_NICKNAME.addEventListener("submit", (event) => {
  event.preventDefault();
  nickname = NICK_INPUT.value;
  NICK_INPUT.value = "";
});
