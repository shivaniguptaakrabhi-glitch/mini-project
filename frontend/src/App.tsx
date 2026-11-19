import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Users from "./pages/Users";
import Posts from "./pages/Posts";
import Follows from "./pages/Follows";
import "./App.css";

function App() {
  return (
    <div className="container">
      <h1>Mini Project API Tester</h1>

      <nav className="navbar">
        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Users
        </NavLink>

        <NavLink
          to="/posts"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Posts
        </NavLink>

        <NavLink
          to="/follows"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Follows
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<Users />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/follows" element={<Follows />} />
      </Routes>
    </div>
  );
}

export default App;