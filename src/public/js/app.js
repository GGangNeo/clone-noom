const socket = io();

// const form = document.querySelector('form');
const welcomeDiv = document.querySelector('#welcome');
const welcomeForm = welcomeDiv.querySelector('form');
const roomDiv = document.querySelector('#room');
const nickForm = document.querySelector(`#nick`);
const msgForm = document.querySelector('#msg');

roomDiv.hidden = true;
let roomName;

function backendDone(msg) {
  console.log(`The Backend msg: ${msg}`);
}

function makeMessage(msg) {
  const ul = roomDiv.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = msg;
  ul.prepend(li);
}

welcomeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector('input');
  const data = input.value;
  input.value = '';
  socket.emit('new_room', data, () => {
    welcomeDiv.hidden = true;
    roomDiv.hidden = false;
    const h3 = roomDiv.querySelector('h3');
    h3.innerText = `Room ${data}`;
    roomName = data;

    nickForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = nickForm.querySelector('input');
      const data = input.value;
      input.value = '';
      socket.emit('nick', data, backendDone);
    });

    msgForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = msgForm.querySelector('input');
      const data = input.value;
      input.value = '';
      socket.emit('new_message', data, roomName, backendDone);
    });
  });
});

socket
  .on('join', (user) => {
    makeMessage(`${user} joined`);
  })
  .on('left', (user) => {
    makeMessage(`${user} left`);
  })
  .on('new_message', makeMessage);
