// import React, { useEffect, useRef } from "react";
// import { Terminal } from "xterm";
// import { FitAddon } from "xterm-addon-fit";
// import "xterm/css/xterm.css";
// import { io } from "socket.io-client";

// const TerminalComponent = ({ vm }) => {
//   const terminalRef = useRef(null);
//   const term = useRef(null);
//   const socket = useRef(null);

//   useEffect(() => {
//     const fitAddon = new FitAddon();
//     term.current = new Terminal({
//       fontSize: 14,
//       rows: 30,
//       theme: {
//         background: "#1e1e1e",
//       },
//     }); 

//     term.current.loadAddon(fitAddon);
//     term.current.open(terminalRef.current);
//     fitAddon.fit();

//     // Connect to backend via socket.io
//     socket.current = io("http://localhost:3000"); // adjust if needed

//     socket.current.emit("start-session", vm);

//     term.current.onData((data) => {
//       socket.current.emit("input", data);
//     });

//     socket.current.on("output", (data) => {
//       term.current.write(data);
//     });

//     return () => {
//       term.current.dispose();
//       socket.current.disconnect();
//     };
//   }, [vm]);

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-2">Connected to {vm.name}</h2>
//       <div
//         ref={terminalRef}
//         style={{ width: "100%", height: "500px" }}
//         className="border border-gray-400 rounded"
//       />
//     </div>
//   );
// };

// export default TerminalComponent;

import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { io } from "socket.io-client";

const TerminalComponent = ({ vm }) => {
  const terminalRef = useRef(null);
  const term = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    const fitAddon = new FitAddon();
    term.current = new Terminal({
      fontSize: 14,
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff"
      }
    });

    term.current.loadAddon(fitAddon);
    term.current.open(terminalRef.current);
    fitAddon.fit();

    socket.current = io("http://localhost:3000");

    // Start SSH session with VM details
    socket.current.emit("start-session", vm);

    term.current.onData((data) => {
      socket.current.emit("input", data);
    });

    socket.current.on("output", (data) => {
      term.current.write(data);
    });

    return () => {
      term.current.dispose();
      socket.current.disconnect();
    };
  }, [vm]);

  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold mb-2">Terminal - {vm.name}</h2>
      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "500px",
          background: "#1e1e1e",
          borderRadius: "5px"
        }}
      />
    </div>
  );
};

export default TerminalComponent;