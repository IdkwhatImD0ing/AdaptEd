import Voice from "../Voice";
import NavBar from "../navBar/NavBar";
export default function Home() {
  return (
    <main className="main">
      <NavBar />

      <div className="main-page">
        <a href="/api/auth/login">Login</a>
        <br />
        <a href="/api/auth/logout">Logout</a>

        <Voice />
        <h1 className="text-4xl font-bold">Teach me</h1>
        <input type="text" placeholder="name a topic" className="large-input" />
        <button type="submit">Make magic</button>
      </div>
    </main>
  );
}
