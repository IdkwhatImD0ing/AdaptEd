"use client";

import { WandSparkles, Sparkles } from "lucide-react";
import NavBarLanding from "./NavBarLanding";
export default function Home() {
  return (
    <div>
      <NavBarLanding />
      <main className="hero">
        <div className="tag">
          <WandSparkles />
          conversational learning
        </div>
        <h1 className="title">
          Learn through conversations.
          <br />
        </h1>
        <h1 className="text-4xl font-bold">Learn anything</h1>
        <input type="text" placeholder="type a topic..." />
        <button type="submit">Submit form</button>
      </main>
      <section>
        <img src="./mockupLanding_adapted.svg" alt="" />
      </section>
    </div>
  );
}
