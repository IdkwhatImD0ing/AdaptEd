'use client';

import React, { useState } from 'react';  // Import React and useState hook
import "../global.sass";
import Voice from "../components/Voice";
import NavBar from "../navBar/NavBar";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Input() {
  // State for managing input value
  const [topic, setTopic] = useState('');
  
  // Event handler for making the API call
  const handleButtonClick = async () => {
    try {
      console.log(topic);
      const formData = new URLSearchParams();
      formData.append('topic', topic);
      const response = await fetch('http://localhost:8000/generate_lecture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data); // Process your response further
    } catch (error) {
      console.error("Failed to fetch data: ", error);
    }
  };

  return (
    <main className="main">
      <div>
        <NavBar />
      </div>

      <div className="main-page">
        <div className="main-text">
          <Link href="/" passHref>
            <img src="../inputCreate_adapted.svg" className="main-create" />
          </Link>

          <h1 className="text-4xl font-bold">Teach me</h1>
          <input
            type="text"
            placeholder="name a topic..."
            className="large-input"
            value={topic}  // Set the value of the input
            onChange={e => setTopic(e.target.value)}  // Update the state on every change
          />
        </div>

        <button className="primary" onClick={handleButtonClick}>
          <Sparkles /> Make magic
        </button>
      </div>
    </main>
  );
}
