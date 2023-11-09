const socket = require("socket.io")();
const http = require("http");
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;

const mongoUrl = "mongodb://127.0.0.1/timeseriesdb"; // Change to your MongoDB URL
const dbName = "timeseriesdb";
const collectionName = "timeseries";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error connecting to MongoDB"));

db.once("open", function () {
  console.log("Connected to Database :: MongoDB");
});

const io = socket.listen(3001); // Listener service listens on port 3001
const crypto = require("crypto");

function decryptMessage(encryptedMessage) {
  // Replace with your actual decryption logic
  // For example, using AES-256-CTR
  const decipher = crypto.createDecipher("aes-256-ctr", "your-secret-key");
  let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

io.on("connection", (socket) => {
  socket.on("message", (message) => {
    // Decrypt the message (implement your decryption function)
    const decryptedMessage = decryptMessage(message.encrypted_payload);

    // Log the received data
    console.log("Received data:", decryptedMessage);

    // Validate data integrity
    const calculatedSecretKey = crypto
      .createHash("sha256")
      .update(JSON.stringify(decryptedMessage))
      .digest("hex");
    if (calculatedSecretKey === message.secret_key) {
      // Data is valid, save it to the database
      saveToDatabase(decryptedMessage);
    }
  });
});

function saveToDatabase(data) {
  MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        console.error("Error connecting to the database:", err);
        return;
      }

      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Add a timestamp field to the data
      data.timestamp = new Date();

      // Insert the data into the MongoDB collection
      collection.insertOne(data, (err) => {
        if (err) {
          console.error("Error saving data to the database:", err);
        }

        client.close();
      });
    }
  );
}
