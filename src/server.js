import express, { json } from 'express';
import WebSocket from 'ws';
import http from 'http';

const app = express();

// set view engine as pus
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
// set public folder, expose for user
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
// catch all url
app.get('/*', (_, res) => res.redirect('/'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

const sockets = [];

wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'Unknown';
  console.log('connect');
  socket.on('close', () => {
    console.log('close');
  });
  socket.on('message', (handle) => {
    // console.log(handle);
    const msg = JSON.parse(handle);
    switch (msg.type) {
      case 'new_message':
        for (const aSocket of sockets) {
          aSocket.send(
            makeMessage('new_message', `${socket.nickname} : ${msg.payload}`)
          );
        }
        break;
      case 'nickname':
        if (socket.nickname !== 'Unknown' && socket.nickname !== msg.payload) {
          socket.send(makeMessage('nickname', msg.payload));
        }
        socket['nickname'] = msg.payload;
        break;
      default:
        break;
    }
  });
});

server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
