import { Console, log } from 'console';
import express, { json } from 'express';
import http from 'http';
import SocketIO from 'socket.io';

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
const wsServer = SocketIO(server);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on('connection', (socket) => {
  socket
    .on('join_room', (roomName) => {
      socket.join(roomName);
      socket.to(roomName).emit('welcome');
      wsServer.sockets.emit('room_num', countRoom(roomName));
      publicRooms();
    })
    .on('disconnecting', () => {
      console.log('disconnect');
      publicRooms();
      wsServer.sockets.emit('room_num', countRoom(publicRooms()[0]) - 1);
    })
    .on('disconnect', () => {
      publicRooms();
    })
    .on('offer', (offer, roomName) => {
      socket.to(roomName).emit('offer', offer);
    })
    .on('answer', (answer, roomName) => {
      socket.to(roomName).emit('answer', answer);
    })
    .on('ice', (ice, roomName) => {
      socket.to(roomName).emit('ice', ice);
    });
});

const port = 3000;
server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
