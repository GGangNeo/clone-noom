import { Console } from 'console';
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

const port = 3000;

function findPublicRooms() {
  // const sids= wsServer.sockets.adapter.sids;
  // const rooms = wsServer.sockets.adapter.rooms;

  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    // room: public, private. sids: private room
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
  socket['nickname'] = 'Unknown';
  socket.onAny((event) => {
    console.log(`Event Any : ${event}`);
  });
  socket
    .on('new_room', (data, cb) => {
      socket.join(data);
      cb();
      console.log(data);
      console.log(countRoom(data));
      socket.to(data).emit('join', socket.nickname, countRoom(data));
      wsServer.sockets.emit('room_change', findPublicRooms());
    })
    .on('disconnecting', () => {
      socket.rooms.forEach((element) => {
        socket
          .to(element)
          .emit('left', socket.nickname, countRoom(element) - 1);
      });
    })
    .on('disconnect', () => {
      wsServer.sockets.emit('room_change', findPublicRooms());
    })
    .on('new_message', (msg, data, cb) => {
      socket.to(data).emit('new_message', `${socket.nickname} : ${msg}`);
      cb('message complete');
    })
    .on('nick', (data, roomName, cb) => {
      const prv = socket.nickname;
      socket['nickname'] = data;
      socket
        .to(roomName)
        .emit('nick_change', `${prv} is changed to ${socket.nickname}`);
      cb('nickname saved');
    });
});

server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
