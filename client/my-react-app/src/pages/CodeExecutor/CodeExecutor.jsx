import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const CodeExecutor = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const socket = useRef(null);

  // Sample code templates for different languages
  const codeTemplates = {
    python: `# Python Example
print("Hello, World!")
for i in range(5):
    print(f"Count: {i}")`,

    javascript: `// JavaScript Example
console.log("Hello, World!");
for (let i = 0; i < 5; i++) {
    console.log(\`Count: \${i}\`);
}`,

    java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}`,

    cpp: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    for (int i = 0; i < 5; i++) {
        cout << "Count: " << i << endl;
    }
    return 0;
}`,

    c: `// C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    for (int i = 0; i < 5; i++) {
        printf("Count: %d\\n", i);
    }
    return 0;
}`,
  };

  useEffect(() => {
    // Initialize socket connection
    socket.current = io("http://localhost:3000");

    // Listen for code execution output
    socket.current.on("code-output", (data) => {
      setOutput((prev) => prev + data);
    });

    // Set initial code template
    setCode(codeTemplates[language]);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Update code template when language changes
    setCode(codeTemplates[language]);
    setOutput(""); // Clear output when changing language
  }, [language]);

  const executeCode = () => {
    if (!code.trim()) {
      alert("Please enter some code to execute!");
      return;
    }

    setIsExecuting(true);
    setOutput(""); // Clear previous output

    // Emit execute-code event with code and language
    socket.current.emit("execute-code", {
      code: code,
      language: language,
    });

    // Reset executing state after a delay
    setTimeout(() => {
      setIsExecuting(false);
    }, 1000);
  };

  const clearOutput = () => {
    setOutput("");
  };

  const loadTemplate = () => {
    setCode(codeTemplates[language]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Code Executor</h1>
        <p className="text-gray-600">
          Write and execute code in multiple programming languages
        </p>
      </div>

      {/* Language Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language:
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript (Node.js)</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Code Input:
            </label>
            <button
              onClick={loadTemplate}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Load Template
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows="20"
            className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={`Enter your ${language} code here...`}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isExecuting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isExecuting ? "🚀 Executing..." : "▶️ Execute Code"}
            </button>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Output:
            </label>
            <button
              onClick={clearOutput}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear Output
            </button>
          </div>
          <div className="bg-black text-green-400 p-3 rounded-md font-mono text-sm h-96 overflow-y-auto border">
            <pre className="whitespace-pre-wrap">
              {output || "Output will appear here..."}
            </pre>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">📋 Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Select your preferred programming language from the dropdown
          </li>
          <li>
            • Write your code in the input area or click "Load Template" for
            examples
          </li>
          <li>• Click "Execute Code" to run your code on the server</li>
          <li>• View the output in real-time in the output panel</li>
          <li>
            • Supported languages: Python, JavaScript (Node.js), Java, C++, C
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CodeExecutor;
