import { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import "../App.css";

function Follows() {
  const [followUserId, setFollowUserId] = useState<string>("");
  const [followersUserId, setFollowersUserId] = useState<string>("");
  const [followingUserId, setFollowingUserId] = useState<string>("");

  const followUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/api/users/${followUserId}/follow`,
        {},
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

  const unfollowUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `http://localhost:5000/api/users/${followUserId}/follow`,
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

  const getFollowers = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/users/${followersUserId}/followers`,
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

  const getFollowing = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/users/${followingUserId}/following`,
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
      <h2>Follows</h2>

      <h3>Follow / Unfollow User</h3>

      <input
        type="number"
        placeholder="User ID"
        value={followUserId}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFollowUserId(e.target.value)
        }
      />

      <button onClick={followUser}>Follow User</button>

      <button onClick={unfollowUser}>Unfollow User</button>

      <hr />

      <h3>Get Followers</h3>

      <input
        type="number"
        placeholder="User ID"
        value={followersUserId}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFollowersUserId(e.target.value)
        }
      />

      <button onClick={getFollowers}>Get Followers</button>

      <hr />

      <h3>Get Following</h3>

      <input
        type="number"
        placeholder="User ID"
        value={followingUserId}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFollowingUserId(e.target.value)
        }
      />

      <button onClick={getFollowing}>Get Following</button>
    </div>
  );
}

export default Follows;