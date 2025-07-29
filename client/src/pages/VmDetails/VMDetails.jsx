// VMDetails.jsx
import React from "react";

const VMDetails = ({ vmList, onViewTerminal }) => {
  return (
    <div className="p-4">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Sl. No.</th>
            <th className="border p-2">VM Name</th>
            <th className="border p-2">IP</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Password</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {vmList.map((vm, index) => (
            <tr key={vm.id}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2">{vm.name}</td>
              <td className="border p-2">{vm.ip}</td>
              <td className="border p-2">{vm.username}</td>
              <td className="border p-2">
                <input
                  type="password"
                  value={vm.password}
                  readOnly
                  className="bg-transparent text-center"
                />
              </td>
              <td className="border p-2 text-center">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => onViewTerminal(vm)}
                >
                  View Terminal
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VMDetails;