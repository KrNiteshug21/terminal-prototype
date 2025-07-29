require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Client } = require('ssh2');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Use your frontend origin in production
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const VM_CONFIG = {
  name: 'webapp',
  host: process.env.HOST,
  port: parseInt(process.env.PORT),
  username: process.env.USER,
  password: process.env.PASSWORD
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-session', () => {
    const conn = new Client();

    conn
      .on('ready', () => {
        console.log('SSH connection established');
        conn.shell((err, stream) => {
          if (err) {
            socket.emit('output', `Shell error: ${err.message}`);
            return;
          }

          stream
            .on('close', () => {
              console.log('Stream closed');
              conn.end();
            })
            .on('data', (data) => {
              socket.emit('output', data.toString());
            });

          socket.on('input', (data) => {
            stream.write(data);
          });

          socket.on('disconnect', () => {
            stream.close();
            conn.end();
          });
        });
      })
      .on('error', (err) => {
        console.error('SSH connection error:', err);
        socket.emit('output', `SSH connection error: ${err.message}`);
      })
      .connect({
        host: VM_CONFIG.host,
        port: VM_CONFIG.port,
        username: VM_CONFIG.username,
        password: VM_CONFIG.password
      });
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});