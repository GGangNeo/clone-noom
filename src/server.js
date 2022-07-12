import express, { json } from "express";
import WebSocket from "ws";
import http from "http";
import { log } from "console";

const app = express();

// set view engine as pus
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
// set public folder, expose for user
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
// catch all url
app.get("/*", (_, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

let sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Unknown";
  console.log("connect");
  socket.on("close", () => {
    console.log("close");
  });
  socket.on("message", (handle) => {
    // console.log(handle);
    const msg = JSON.parse(handle);
    switch (msg.type) {
      case "new_message":
        for (const aSocket of sockets) {
          aSocket.send(`${socket.nickname} : ${msg.payload}`);
        }
        break;
      case "nickname":
        socket["nickname"] = msg.payload;
        break;
    }
  });
});

server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
