"use client";
import React from "react";
import { MessageTranscript } from "./Voice";

export default function Sidebar(props: { messages: MessageTranscript[] }) {
  return (
    <div className="flex flex-col w-full h-screen p-4 bg-gray-800 text-white">
      {/* <h2 className="text-2xl font-bold mb-4">Chat Log</h2> */}
      <div className="flex-1 overflow-y-auto">
        {props.messages.map((message, index) => (
          <div key={index} className="mb-4">
            <p className="text-gray-400 text-sm">{message.role}</p>
            <p className="text-white">{message.content}</p>
          </div>
        ))}
      </div>
      {/* <div className="mt-4 flex items-center">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="ml-2 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Send
        </button>
      </div> */}
    </div>
  );
}
