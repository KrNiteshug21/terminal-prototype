require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Client } = require("ssh2");

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

  let conn = null;
  let shellStream = null;

  socket.on("start-session", (vm) => {
    conn = new Client();

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

          shellStream = stream;

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

  // Handle remote code execution
  socket.on("run-command", ({ code, language }) => {
    if (!conn || !conn._sock || conn._sock.destroyed) {
      socket.emit("output", "SSH connection not established.");
      return;
    }

    const filename = {
      python: "script.py",
      bash: "script.sh",
      sh: "script.sh",
      js: "script.js",
    }[language] || "script.sh";

    const interpreter = {
      python: "python3",
      bash: "bash",
      sh: "sh",
      js: "node",
    }[language] || "bash";

    const remotePath = `/tmp/${Date.now()}_${filename}`;

    const fullCommand = `echo ${JSON.stringify(code)} > ${remotePath} && ${interpreter} ${remotePath} && rm ${remotePath}`;

    console.log(`Running command on remote: ${fullCommand}`);

    conn.exec(fullCommand, (err, stream) => {
      if (err) {
        socket.emit("output", `Execution error: ${err.message}`);
        return;
      }

      stream
        .on("close", (code, signal) => {
          socket.emit("output", `\n[Process exited with code ${code}]\n`);
        })
        .on("data", (data) => {
          socket.emit("output", data.toString());
        })
        .stderr.on("data", (data) => {
          socket.emit("output", `Error: ${data.toString()}`);
        });
    });
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
