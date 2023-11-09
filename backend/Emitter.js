const socket = require('socket.io-client');
const crypto = require('crypto');
const socketClient = socket.connect('http://localhost:3001'); // Change to the actual server URL

const data = require('./data.json');

// Implement your encryption function here
function encryptMessage(message) {
  // Replace with your actual encryption logic
  // For example, using AES-256-CTR
  const cipher = crypto.createCipher('aes-256-ctr', 'your-secret-key');
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function generateRandomMessage() {
  const randomName = data.names[Math.floor(Math.random() * data.names.length)];
  const randomOrigin = data.cities[Math.floor(Math.random() * data.cities.length)];
  const randomDestination = data.cities[Math.floor(Math.random() * data.cities.length)];

  const message = {
    name: randomName,
    origin: randomOrigin,
    destination: randomDestination,
  };

  // Calculate the secret_key
  const secretKey = crypto.createHash('sha256').update(JSON.stringify(message)).digest('hex');

  // Encrypt the payload using your encryption function
  const encryptedMessage = encryptMessage(JSON.stringify(message));

  return {
    ...message,
    secret_key: secretKey,
    encrypted_payload: encryptedMessage,
  };
}

setInterval(() => {
  const message = generateRandomMessage();

  // Log the message before emitting it
  console.log('Sending message:', message);

  socketClient.emit('message', message);
}, 10000); // Emit a new message every 10 seconds
