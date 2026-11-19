import { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import "../App.css";

function Posts() {
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [status, setStatus] = useState<string>("draft");

  const [postId, setPostId] = useState<string>("");

  const [updatePostId, setUpdatePostId] = useState<string>("");
  const [updateTitle, setUpdateTitle] = useState<string>("");
  const [updateBody, setUpdateBody] = useState<string>("");
  const [updateStatus, setUpdateStatus] = useState<string>("draft");

  const [deletePostId, setDeletePostId] = useState<string>("");

  const createPost = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/posts",
        {
          title,
          body,
          status,
        },
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

  const getPost = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/posts/${postId}`,
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

  const updatePost = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `http://localhost:5000/api/posts/${updatePostId}`,
        {
          title: updateTitle,
          body: updateBody,
          status: updateStatus,
        },
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

  const deletePost = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `http://localhost:5000/api/posts/${deletePostId}`,
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
      <h2>Posts</h2>

      <h3>Create Post</h3>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
      />

      <textarea
        placeholder="Content"
        value={body}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setBody(e.target.value)
        }
      />

      <select
        value={status}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setStatus(e.target.value)
        }
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <button onClick={createPost}>Create Post</button>

      <hr />

      <h3>Get Post</h3>

      <input
        type="number"
        placeholder="Post ID"
        value={postId}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPostId(e.target.value)
        }
      />

      <button onClick={getPost}>Get Post</button>

      <hr />

      <h3>Update Post</h3>

      <input
        type="number"
        placeholder="Post ID"
        value={updatePostId}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUpdatePostId(e.target.value)
        }
      />

      <input
        type="text"
        placeholder="New Title"
        value={updateTitle}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUpdateTitle(e.target.value)
        }
      />

      <textarea
        placeholder="New Content"
        value={updateBody}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setUpdateBody(e.target.value)
        }
      />

      <select
        value={updateStatus}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setUpdateStatus(e.target.value)
        }
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <button onClick={updatePost}>Update Post</button>

      <hr />

      <h3>Delete Post</h3>

      <input
        type="number"
        placeholder="Post ID"
        value={deletePostId}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setDeletePostId(e.target.value)
        }
      />

      <button onClick={deletePost}>Delete Post</button>
    </div>
  );
}

export default Posts;