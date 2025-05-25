const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '../client/public')));

// In-memory message storage
let messages = [];

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(messages));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch(message.action) {
        case 'CREATE':
          const newMessage = {
            id: uuidv4(),
            content: message.content,
            timestamp: new Date().toISOString()
          };
          messages.push(newMessage);
          break;
          
        case 'UPDATE':
          messages = messages.map(msg => 
            msg.id === message.id ? {...msg, content: message.content} : msg
          );
          break;
          
        case 'DELETE':
          messages = messages.filter(msg => msg.id !== message.id);
          break;
      }

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messages));
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});