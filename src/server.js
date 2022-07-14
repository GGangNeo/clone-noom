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

wsServer.on('connection', (socket) => {
  socket.onAny((event) => {
    console.log(`Event Any : ${event}`);
  });
  socket.on('new_room', (data, cb) => {
    socket.join(data);
    cb();
    console.log(data);
    socket.to(data).emit('join');
  });
  socket.on('new_message', (data, cb) => {
    console.log(data);
    cb('message complete');
  });
});

server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
