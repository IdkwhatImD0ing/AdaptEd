import Image from "next/image";

import Login from "./login/login.jsx";

export default function Home() {
  return (
    <div>
      <a href="/api/auth/login">Login</a>
      <br />
      <a href="/api/auth/logout">Logout</a>
    </div>
  );
}
