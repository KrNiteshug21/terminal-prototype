// App.jsx
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Replace with your Express server IP if different

function App() {
  const [command, setCommand] = useState('');
  const [isRemote, setIsRemote] = useState(true);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Listen for command output
    socket.on('output', (data) => {
      setTerminalHistory(prev => [
        ...prev,
        { type: 'output', content: data, timestamp: new Date() }
      ]);
    });

    // Listen for connection status
    socket.on('connection-status', (data) => {
      setConnectionStatus(data.status);
      setTerminalHistory(prev => [
        ...prev,
        { 
          type: 'system', 
          content: `[${data.status.toUpperCase()}] ${data.message}`, 
          timestamp: new Date() 
        }
      ]);
    });

    // Welcome message
    setTerminalHistory([
      { 
        type: 'system', 
        content: 'Terminal connected. Type commands below.', 
        timestamp: new Date() 
      }
    ]);

    return () => {
      socket.off('output');
      socket.off('connection-status');
    };
  }, []);

  const handleRun = () => {
    if (!command.trim()) return;

    // Add command to history
    const commandEntry = {
      type: 'command',
      content: `${isRemote ? 'remote' : 'local'}:${currentDirectory}$ ${command}`,
      timestamp: new Date()
    };

    setTerminalHistory(prev => [...prev, commandEntry]);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Send command to server
    socket.emit('run-command', { command, remote: isRemote });
    
    // Clear input
    setCommand('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setTerminalHistory([]);
  };

  const testConnection = () => {
    socket.emit('test-connection');
  };

  useEffect(() => {
    // Auto scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#0f0';
      case 'testing': return '#ff0';
      case 'error': return '#f00';
      default: return '#888';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Terminal Interface</h2>
        <div style={styles.statusBar}>
          <div style={{...styles.statusIndicator, backgroundColor: getStatusColor()}}>
            {connectionStatus.toUpperCase()}
          </div>
          <button onClick={testConnection} style={styles.smallButton}>
            Test Connection
          </button>
          <button onClick={clearTerminal} style={styles.smallButton}>
            Clear
          </button>
        </div>
      </div>
      
      <div style={styles.modeSelector}>
        <label style={styles.modeLabel}>
          <input
            type="radio"
            checked={isRemote}
            onChange={() => setIsRemote(true)}
          />
          Remote (Linux VM)
        </label>
        <label style={styles.modeLabel}>
          <input
            type="radio"
            checked={!isRemote}
            onChange={() => setIsRemote(false)}
          />
          Local (Windows)
        </label>
      </div>

      <div ref={terminalRef} style={styles.terminal}>
        {terminalHistory.map((entry, index) => (
          <div key={index} style={styles.terminalLine}>
            <span style={styles.timestamp}>
              {entry.timestamp.toLocaleTimeString()}
            </span>
            <span style={{
              ...styles.terminalContent,
              color: entry.type === 'command' ? '#00ff00' : 
                     entry.type === 'system' ? '#ffff00' : '#ffffff'
            }}>
              {entry.content}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <span style={styles.prompt}>
          {isRemote ? 'remote' : 'local'}:{currentDirectory}$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyPress}
          style={styles.commandInput}
          placeholder="Type command and press Enter..."
          autoComplete="off"
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: '1rem auto',
    fontFamily: 'Consolas, "Courier New", monospace',
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #333',
    paddingBottom: '1rem',
  },
  title: {
    color: '#fff',
    margin: 0,
    fontSize: '1.5rem',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '0.5rem',
  },
  smallButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modeSelector: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: '#2d2d2d',
    borderRadius: '4px',
  },
  modeLabel: {
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  terminal: {
    flex: 1,
    backgroundColor: '#000',
    color: '#fff',
    padding: '1rem',
    overflowY: 'auto',
    borderRadius: '4px',
    border: '1px solid #333',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  terminalLine: {
    display: 'flex',
    marginBottom: '0.25rem',
  },
  timestamp: {
    color: '#666',
    fontSize: '0.8rem',
    marginRight: '1rem',
    minWidth: '80px',
  },
  terminalContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '1rem',
    backgroundColor: '#2d2d2d',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  prompt: {
    color: '#0f0',
    marginRight: '0.5rem',
    fontWeight: 'bold',
    minWidth: 'auto',
  },
  commandInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'Consolas, "Courier New", monospace',
    outline: 'none',
    padding: '0.25rem',
  },
};

export default App;
