// import React, { useEffect, useState } from "react";
// import CodeMirror from "@uiw/react-codemirror";
// import { python } from "@codemirror/lang-python";
// // import { javascript } from "@codemirror/lang-javascript";
// // import { markdown } from "@codemirror/lang-markdown";
// // import { html } from "@codemirror/lang-html";
// // import { css } from "@codemirror/lang-css";

// // const extensionToLanguageMap = {
// //   js: "javascript",
// //   jsx: "javascript",
// //   py: "python",
// //   md: "markdown",
// //   html: "html",
// //   css: "css",
// // };

// const languages = {
//   python: python(),
//   // javascript: javascript({ jsx: true }),
//   // markdown: markdown(),
//   // html: html(),
//   // css: css(),
// };

// const CodeEditor = () => {
//   const [code, setCode] = useState("print('hello world!');");
//   const [lang, setLang] = useState("python");

//   const onChange = (val) => {
//     console.log("val:", val);
//     setCode(val);
//   };

//   const runCode = () => {
//     if (command.trim()) {
//       socket.emit("run-command", command);
//     }
//   };

//   return (
//     <div className="pl-1 w-full">
//       <h2 className="text-lg font-semibold mb-2">Code Editor</h2>
//       <CodeMirror
//         value={code}
//         height={"50vh"}
//         width="100%"
//         extensions={languages[lang]}
//         onChange={onChange}
//       />
//       <div className="mx-auto mt-4 flex items-center gap-4">
//         <button
//           onClick={runCode}
//           className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Run Code
//         </button>
//         <button
//           onClick={() => setCode("")}
//           className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
//         >
//           Clear
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CodeEditor;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import "xterm/css/xterm.css";

// 🔌 Initialize socket connection
const socket = io("http://localhost:3000"); // update if your backend is hosted elsewhere

const languages = {
  python: python(),
  // You can add more later, e.g., JavaScript, Bash
};

const CodeEditor = () => {
  const [code, setCode] = useState("print('hello world!')");
  const [lang, setLang] = useState("python");
  const [output, setOutput] = useState("");

  useEffect(() => {
    socket.on("output", (data) => {
      setOutput((prev) => prev + data);
    });

    return () => {
      socket.off("output");
    };
  }, []);

  const onChange = (val) => {
    setCode(val);
  };

  const runCode = () => {
    if (code.trim()) {
      setOutput(""); // clear previous output
      socket.emit("run-command", { code, language: lang });
    }
  };

  return (
    <div className="pl-1 w-full">
      <h2 className="text-lg font-semibold mb-2">Code Editor</h2>
      <CodeMirror
        value={code}
        height="50vh"
        width="100%"
        extensions={[languages[lang]]}
        onChange={onChange}
      />
      <div className="mx-auto mt-4 flex items-center gap-4">
        <button
          onClick={runCode}
          className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Code
        </button>
        <button
          onClick={() => setCode("")}
          className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Clear
        </button>
      </div>

      <div className="mt-6 bg-black text-white p-4 rounded h-[200px] overflow-auto font-mono text-sm whitespace-pre-wrap">
        <h3 className="font-bold mb-2">Output:</h3>
        {output || "No output yet"}
      </div>
    </div>
  );
};

export default CodeEditor;
