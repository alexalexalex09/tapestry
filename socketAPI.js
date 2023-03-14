require("dotenv").config();
const mongoose = require("mongoose");
var socket_io = require("socket.io");
var io = socket_io();
var socketAPI = {};
socketAPI.io = io;

// connect to MongoDB database
mongoose
  .connect(process.env.mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// define schema for coordinates collection
const coordinateSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  color: String,
});

// create model for coordinates collection
const Coordinate = mongoose.model("Coordinate", coordinateSchema);

io.on("connection", (socket) => {
  console.log("a user connected");

  // listen for incoming data (coordinates and color)
  socket.on("data", (data) => {
    console.log("data received:", data);
    socket.broadcast.emit("data", data);
    savePixel(data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  //get the array of existing pixels
  socket.on("getPixels", async () => {
    const pixels = await getAllPixels();
    socket.emit("pixels", pixels);
  });
});

async function getAllPixels() {
  try {
    const pixels = await Coordinate.find();
    return pixels;
  } catch (error) {
    console.error("Error retrieving pixels:", error);
    return [];
  }
}

async function savePixel(pixel) {
  const filter = { x: pixel.x, y: pixel.y };
  const update = { color: pixel.color };
  const options = { upsert: true };

  try {
    const result = await Coordinate.updateOne(filter, update, options);
    console.log("savePixel result:", result);
  } catch (error) {
    console.error("Error saving pixel:", error);
  }
}

module.exports = socketAPI;
