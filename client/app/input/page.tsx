"use client";

import React, { useState } from "react"; // Import React and useState hook
import "../global.sass";
import Voice from "../components/Voice";
import NavBar from "../navBar/NavBar";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function Input() {
  // State for managing input value
  const [topic, setTopic] = useState("");

  const { push } = useRouter();

  // Event handler for making the API call
  const handleButtonClick = async () => {
    try {
      console.log(topic);

      push(`/research?topic=${encodeURIComponent(topic)}`);
    } catch (error) {
      console.error("Failed to store data: ", error);
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
            value={topic} // Set the value of the input
            onChange={(e) => setTopic(e.target.value)} // Update the state on every change
          />
        </div>

        <button className="primary" onClick={handleButtonClick}>
          <Sparkles /> Make magic
        </button>
      </div>
    </main>
  );
}
