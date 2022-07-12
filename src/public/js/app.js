const UL = document.querySelector('ul');
const FORM_NICKNAME = document.getElementById('nickname');
const FORM_MESSAGE = document.getElementById('message');
const NICK_INPUT = FORM_NICKNAME.querySelector('input');
const FORM_INPUT = FORM_MESSAGE.querySelector('input');

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', (msg) => {
  console.log(msg.type);
});

socket.addEventListener('close', (msg) => {
  console.log(msg.type);
});

socket.addEventListener('error', (msg) => {
  console.log(msg.type);
});

socket.addEventListener('message', (handle) => {
  const msg = JSON.parse(handle.data);
  console.log(handle.data);

  if (msg.type !== 'nickname') {
    const li = document.createElement('li');
    UL.prepend(li);
    li.innerText = msg.payload;
  } else {
    alert(`Nickname changed to ${msg.payload} !!`);
  }
});

FORM_MESSAGE.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = FORM_INPUT.value;
  FORM_INPUT.value = '';
  socket.send(makeMessage('new_message', data));
});

FORM_NICKNAME.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = NICK_INPUT.value;
  NICK_INPUT.value = '';
  socket.send(makeMessage('nickname', data));
});
