// server.js
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client } from 'ssh2';
import { spawn } from 'child_process';
import cors from 'cors';
import net from 'net';

// Environment variables
const { HOST, PORT: SSH_PORT, USER, PASSWORD } = process.env;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  // Test Linux VM connection when client connects
  testVMConnection(socket);

  socket.on('run-command', ({ command, remote }) => {
    if (remote) {
      runRemoteCommand(socket, command);
    } else {
      runLocalCommand(socket, command);
    }
  });

  socket.on('test-connection', () => {
    testVMConnection(socket);
  });
});

function testNetworkConnectivity(host, port) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    socket.setTimeout(5000); // 5 second timeout
    
    socket.on('connect', () => {
      console.log(`✅ Network connectivity to ${host}:${port} successful`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Network timeout to ${host}:${port}`);
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Network error to ${host}:${port}:`, err.message);
      reject(err);
    });
    
    socket.connect(port, host);
  });
}

function testVMConnection(socket) {
  console.log(`Testing VM connection to ${HOST}:${SSH_PORT}...`);
  socket.emit('connection-status', { status: 'testing', message: 'Testing connection to Linux VM...' });
  
  // First test basic network connectivity
  testNetworkConnectivity(HOST, SSH_PORT)
    .then(() => {
      console.log('Network connectivity test passed, attempting SSH...');
      attemptSSHConnection(socket);
    })
    .catch((err) => {
      console.log('Network connectivity test failed:', err.message);
      socket.emit('connection-status', { 
        status: 'error', 
        message: `Network connectivity failed: ${err.message}. Please check if the VM is running and accessible.`
      });
    });
}

function attemptSSHConnection(socket) {
  const conn = new Client();
  
  conn.on('ready', () => {
    console.log('✅ VM SSH connection successful');
    socket.emit('connection-status', { 
      status: 'connected', 
      message: `Successfully connected to Linux VM (${HOST})` 
    });
    conn.end();
  });

  conn.on('error', (err) => {
    console.log('❌ VM SSH connection failed:');
    console.log('Error code:', err.code);
    console.log('Error message:', err.message);
    console.log('Error level:', err.level);
    
    let detailedMessage = `SSH connection failed: ${err.message}`;
    
    // Provide more specific error information
    if (err.code === 'ENOTFOUND') {
      detailedMessage += ' (Host not found - check IP address)';
    } else if (err.code === 'ECONNREFUSED') {
      detailedMessage += ' (Connection refused - check if SSH service is running)';
    } else if (err.code === 'ETIMEDOUT') {
      detailedMessage += ' (Connection timeout - check network connectivity)';
    } else if (err.level === 'client-authentication') {
      detailedMessage += ' (Authentication failed - check username/password)';
    } else if (err.message.includes('All configured authentication methods failed')) {
      detailedMessage += ' (Authentication failed - wrong username or password)';
    }
    
    socket.emit('connection-status', { 
      status: 'error', 
      message: detailedMessage
    });
  });

  conn.on('close', () => {
    console.log('SSH connection closed');
  });

  conn.on('end', () => {
    console.log('SSH connection ended');
  });

  console.log(`Attempting SSH connection with credentials: ${USER}@${HOST}:${SSH_PORT}`);

  conn.connect({
    host: HOST,
    port: SSH_PORT,
    username: USER,
    password: PASSWORD,
    readyTimeout: 10000, // Increased timeout
    // debug: (info) => console.log('SSH Debug:', info) // Uncomment for detailed SSH debugging
  });
}

function runRemoteCommand(socket, command) {
  const conn = new Client();
  
  conn.on('ready', () => {
    conn.exec(command, (err, stream) => {
      if (err) return socket.emit('output', `Error: ${err.message}`);
      stream.on('data', (data) => socket.emit('output', data.toString()));
      stream.stderr.on('data', (data) => socket.emit('output', data.toString()));
      stream.on('close', () => conn.end());
    });
  });

  conn.on('error', (err) => {
    socket.emit('output', `Connection Error: ${err.message}\n`);
    console.log('SSH connection error:', err.message);
  });

  conn.connect({
    host: HOST,
    port: SSH_PORT,
    username: USER,
    password: PASSWORD,
    readyTimeout: 10000 // 10 second timeout for commands
  });
}

function runLocalCommand(socket, command) {
  const child = spawn(command, { shell: true });
  child.stdout.on('data', (data) => socket.emit('output', data.toString()));
  child.stderr.on('data', (data) => socket.emit('output', data.toString()));
  child.on('close', (code) => socket.emit('output', `Process exited with code ${code}`));
}

server.listen(3000, () => console.log('Server on port 3000'));
