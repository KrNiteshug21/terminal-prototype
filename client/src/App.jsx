import React, { useState } from "react";
import VMDetails from "./pages/VmDetails/VmDetails";
import TerminalComponent from "./pages/Terminal/Terminal";
import CodeEditor from "./pages/CodeEditor/CodeEditor";
import CodeExecutor from "./pages/CodeExecutor/CodeExecutor";

const App = () => {
  const [selectedVM, setSelectedVM] = useState(null);
  const [activeTab, setActiveTab] = useState("vm-manager");

  const vmList = [
    {
      id: 1,
      name: "Ubuntu-server",
      ip: "10.252.7.234",
      port: 22,
      username: "user",
      password: "cdac123",
    },
    {
      id: 2,
      name: "survey sleek",
      ip: "10.252.7.233",
      port: 22,
      username: "Neeraj",
      password: "cdac@123",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">VM Manager</h1>
      <VMDetails vmList={vmList} onViewTerminal={setSelectedVM} />
      <div className="flex items-center gap-4">
        <CodeEditor />
        {selectedVM && <TerminalComponent vm={selectedVM} />}
      </div>
    </div>
  );
};

export default App;

// import React, { useState } from "react";
// import VMDetails from "./pages/VmDetails/oldVmDetails";
// import TerminalComponent from "./pages/Terminal/Terminal";

// const App = () => {
//   const [selectedVM, setSelectedVM] = useState(null);

//   const vmList = [
//     {
//       id: 1,
//       name: "webapp",
//       ip: "10.0.0.1",
//       username: "user",
//       password: "sumit123",
//     },
//   ];

//   const handleViewTerminal = (vm) => {
//     setSelectedVM(vm);
//   };

//   return (
//     <div className="p-6 font-sans">
//       <h1 className="text-2xl font-bold mb-4">VM Dashboard</h1>
//       <VMDetails vmList={vmList} onViewTerminal={handleViewTerminal} />
//       {selectedVM && (
//         <div className="mt-6">
//           <TerminalComponent vm={selectedVM} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
