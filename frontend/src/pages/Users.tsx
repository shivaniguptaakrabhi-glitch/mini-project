import { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import "../App.css";

function Users() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  const [userId, setUserId] = useState<string>("");

  const signupUser = async (): Promise<void> => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          username,
          email,
          password,
        }
      );

      console.log(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data ?? err.message);
      } else {
        console.error(err);
      }
    }
  };

  const loginUser = async (): Promise<void> => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: loginEmail,
          password: loginPassword,
        }
      );

      localStorage.setItem("token", res.data.token);

      console.log(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data ?? err.message);
      } else {
        console.error(err);
      }
    }
  };

  const getMe = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data ?? err.message);
      } else {
        console.error(err);
      }
    }
  };

  const getUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data ?? err.message);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="card">
      <h2>Users</h2>

      <h3>Sign Up</h3>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={signupUser}>Sign Up</button>

      <hr />

      <h3>Login</h3>

      <input
        type="email"
        placeholder="Email"
        value={loginEmail}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setLoginEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={loginPassword}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setLoginPassword(e.target.value)
        }
      />

      <button onClick={loginUser}>Login</button>

      <hr />

      <h3>Profile</h3>

      <button onClick={getMe}>Get My Profile</button>

      <hr />

      <h3>Get User By ID</h3>

      <input
        type="number"
        placeholder="User ID"
        value={userId}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUserId(e.target.value)
        }
      />

      <button onClick={getUser}>Get User</button>
    </div>
  );
}

export default Users;