import Image from "next/image";
import Voice from "./Voice";
import NavBar from "./navBar/NavBar";
import { WandSparkles, Sparkles } from "lucide-react";
export default function Home() {
  return (
    <main className="hero">
      <div className="tag">
        <WandSparkles />
        conversational learning
      </div>
      <h1 className="title">
        Learn through conversations.
        <br />
        Not textbooks.
      </h1>
      <button className="primary">
        {" "}
        <Sparkles /> Make magic
      </button>
    </main>
  );
}
