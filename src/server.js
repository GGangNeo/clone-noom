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

wsServer.on('connection', (socket) => {
  socket
    .on('join_room', (roomName) => {
      socket.join(roomName);
      socket.to(roomName).emit('welcome');
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
