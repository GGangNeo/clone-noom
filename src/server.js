import express from "express";
import WebSocket from "ws";
import http from "http";

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

const handleListen = () => console.log(`Listening on http://localhost:3000`);

wss.on("connection", (socketServer) => {
  console.log(socketServer);
});

server.listen(8080, handleListen);
