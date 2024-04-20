import Image from "next/image";
import Voice from "./Voice";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <a href="/api/auth/login">Login</a>
        <br />
        <a href="/api/auth/logout">Logout</a>
      </div>
      <Voice />
    </main>
  );
}
