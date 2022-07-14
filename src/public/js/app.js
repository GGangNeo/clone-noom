const socket = io();

const welcomeDiv = document.querySelector('#welcome');
// const form = document.querySelector('form');
const form = welcomeDiv.querySelector('form');

function backendDone(msg) {
  console.log(`The Backend msg: ${msg}`);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = form.querySelector('input');
  const data = input.value;
  input.value = '';
  socket.emit('new_room', { payload: data }, backendDone);
});
