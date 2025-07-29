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
    print(f"Count: {i}")

# Math operations
import math
print(f"Square root of 16: {math.sqrt(16)}")`,

    javascript: `// JavaScript Example
console.log("Hello, World!");
for (let i = 0; i < 5; i++) {
    console.log(\`Count: \${i}\`);
}

// Array operations
const numbers = [1, 2, 3, 4, 5];
console.log("Sum:", numbers.reduce((a, b) => a + b, 0));`,

    java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Loop example
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
        
        // Simple calculation
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum of 1-10: " + sum);
    }
}`,

    cpp: `// C++ Example
#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Loop example
    for (int i = 0; i < 5; i++) {
        cout << "Count: " << i << endl;
    }
    
    // Vector example
    vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    cout << "Sum: " << sum << endl;
    
    return 0;
}`,

    c: `// C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Loop example
    for (int i = 0; i < 5; i++) {
        printf("Count: %d\\n", i);
    }
    
    // Simple calculation
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    printf("Sum of 1-10: %d\\n", sum);
    
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
    }, 2000);
  };

  const clearOutput = () => {
    setOutput("");
  };

  const loadTemplate = () => {
    setCode(codeTemplates[language]);
    setOutput("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🚀 Code Executor
        </h1>
        <p className="text-gray-600">
          Write and execute code in multiple programming languages in real-time
        </p>
      </div>

      {/* Language Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Programming Language:
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="python">🐍 Python</option>
          <option value="javascript">📜 JavaScript (Node.js)</option>
          <option value="java">☕ Java</option>
          <option value="cpp">⚡ C++</option>
          <option value="c">🔧 C</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-lg font-medium text-gray-700">
              📝 Code Editor
            </label>
            <div className="flex gap-2">
              <button
                onClick={loadTemplate}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                📋 Load Template
              </button>
              <button
                onClick={() => setCode("")}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows="22"
            className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
            placeholder={`Enter your ${language} code here...`}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isExecuting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {isExecuting ? "🔄 Executing..." : "▶️ Execute Code"}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-lg font-medium text-gray-700">
              💻 Terminal Output
            </label>
            <button
              onClick={clearOutput}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              🗑️ Clear Output
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto border border-gray-300 shadow-inner">
            <div className="flex items-center mb-2 text-gray-500">
              <span className="text-green-400">●</span>
              <span className="ml-2 text-xs">Terminal Session Active</span>
            </div>
            <pre className="whitespace-pre-wrap">
              {output || (
                <span className="text-gray-500">
                  📟 Waiting for code execution...\n\n 💡 Tips:\n • Select a
                  programming language\n • Write your code or load a template\n
                  • Click "Execute Code" to run\n • Output will appear here in
                  real-time
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>

      {/* Instructions & Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📋 How to Use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select your preferred programming language</li>
            <li>• Write code or click "Load Template" for examples</li>
            <li>• Click "Execute Code" to run on the server</li>
            <li>• View real-time output in the terminal panel</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">
            🌟 Supported Languages:
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 🐍 Python (interpreted)</li>
            <li>• 📜 JavaScript/Node.js (interpreted)</li>
            <li>• ☕ Java (compiled & executed)</li>
            <li>• ⚡ C++ (compiled & executed)</li>
            <li>• 🔧 C (compiled & executed)</li>
          </ul>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 p-3 bg-gray-100 rounded-lg flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              socket.current?.connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {socket.current?.connected
            ? "Connected to server"
            : "Disconnected from server"}
        </div>
        <div>
          Current Language:{" "}
          <span className="font-medium">{language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeExecutor;
