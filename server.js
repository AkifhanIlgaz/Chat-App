const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.Promise = Promise;
const dbURL = "mongodb+srv://user:user@cluster0.xvfjbe8.mongodb.net/test";

const Message = mongoose.model("Message", {
  name: String,
  message: String,
});

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.get("/messages/:user", (req, res) => {
  const user = req.params.user;
  Message.find({ name: user }, (err, messages) => {
    res.send(messages);
  });
});

app.post("/messages", async (req, res) => {
  try {
    const message = new Message(req.body);

    let savedMessage = await message.save();

    console.log("Saved");

    let censored = await Message.findOne({ message: "badword" });

    if (censored) {
      await Message.deleteOne({ _id: censored.id });
      console.log("Censored message deleted", censored);
    } else {
      io.emit("message", req.body);
    }
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.error(error);
  } finally {
    console.log("Message post is called");
  }
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
