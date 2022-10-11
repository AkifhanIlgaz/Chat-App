const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbURL = "mongodb+srv://user:user@node-js.mwko205.mongodb.net/test";

const Message = mongoose.model("Message", {
  name: String,
  message: String,
});

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.post("/messages", (req, res) => {
  const message = new Message(req.body);

  message.save((err) => {
    if (err) res.send(500);

    io.emit("message", req.body);
    res.sendStatus(200);
  });
});

io.on("connection", (socket) => {
  console.log("User connected");
});

mongoose.connect(dbURL, (err) => {
  console.log("MongoDB connection", err);
});

const server = http.listen(4000, () => {
  console.log(`Server is listening on port ${server.address().port}`);
});
