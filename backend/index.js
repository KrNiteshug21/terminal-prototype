require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Client } = require("ssh2");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("start-session", (vm) => {
    const conn = new Client();
    console.log(`Starting SSH session for VM: ${vm.name}`);
    console.log(`Connecting to ${vm.ip}:${vm.port} as ${vm.username}`);

    conn
      .on("ready", () => {
        console.log(`SSH connected to ${vm.ip}`);
        conn.shell((err, stream) => {
          if (err) {
            socket.emit("output", `Shell error: ${err.message}`);
            return;
          }

          stream
            .on("close", () => {
              console.log("SSH stream closed");
              conn.end();
            })
            .on("data", (data) => {
              socket.emit("output", data.toString());
            });

          socket.on("input", (data) => {
            stream.write(data);
          });

          socket.on("disconnect", () => {
            stream.close();
            conn.end();
          });
        });
      })
      .on("execute-code", ({ code, language }) => {
        console.log(`Executing code in ${language}:`);
        console.log(code);
      })
      .on("error", (err) => {
        console.error("SSH connection error:", err);
        socket.emit("output", `SSH error: ${err.message}`);
      })
      .connect({
        host: vm.ip,
        port: parseInt(vm.port || 22),
        username: vm.username,
        password: vm.password,
      });
  });

  socket.on("execute-code", ({ code, language }) => {
    console.log(`Executing code in ${language}:`);
    console.log(code);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
