const socket = io();

// const form = document.querySelector('form');
const welcomeDiv = document.querySelector('#welcome');
const welcomeForm = welcomeDiv.querySelector('form');
const roomDiv = document.querySelector('#room');
const roomForm = roomDiv.querySelector('form');

roomDiv.hidden = true;

function backendDone(msg) {
  console.log(`The Backend msg: ${msg}`);
}

welcomeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector('input');
  const data = input.value;
  input.value = '';
  socket.emit('new_room', { payload: data }, () => {
    welcomeDiv.hidden = true;
    roomDiv.hidden = false;
    const h3 = roomDiv.querySelector('h3');
    h3.innerText = `Room ${data}`;
  });
});

roomForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = roomForm.querySelector('input');
  const data = input.value;
  input.value = '';
  socket.emit('new_message', { payload: data }, backendDone);
});
