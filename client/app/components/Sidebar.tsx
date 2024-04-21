"use client";
import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 h-screen p-4 bg-gray-800 text-white">
      <h2 className="text-2xl font-bold mb-4">Chat Log</h2>
      <div className="flex-1 overflow-y-auto">
        {/* Chat messages will be displayed here */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm">User</p>
          <p className="text-white">Hello, how can I assist you today?</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-400 text-sm">Assistant</p>
          <p className="text-white">
            I'm here to help! What would you like to know?
          </p>
        </div>
        {/* Add more chat messages as needed */}
      </div>
      <div className="mt-4 flex items-center">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="ml-2 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Send
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
