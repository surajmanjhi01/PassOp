import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import eyeIcon from "../assets/eye.png";
import eyeCrossedIcon from "../assets/eyecross.png";
import copyIcon from "../assets/copy.png";
import EditIcon from "../assets/edit.png";
import DeleteIcon from "../assets/delete.png";

// ❌ REMOVE THIS (cors is backend only)
// const cors = require('cors');

const Manager = () => {
  const eyeRef = useRef(null);
  const passRef = useRef(null);

  const [form, setForm] = useState({
    site: "",
    username: "",
    password: ""
  });

  const [passwordArray, setPasswordArray] = useState([]);

  // Fetch passwords from backend
  const getpasswords = async () => {
    let req = await fetch("http://localhost:3000/");
    let passwords = await req.json();
    if (passwords) {
      console.log(passwords);
      setPasswordArray(passwords);
    }
  };

  useEffect(() => {
    getpasswords();
  }, []);

  // Show / Hide Password
  const showPassword = () => {
    if (passRef.current.type === "password") {
      passRef.current.type = "text";
      eyeRef.current.src = eyeCrossedIcon;
    } else {
      passRef.current.type = "password";
      eyeRef.current.src = eyeIcon;
    }
  };

  // Save Password (MongoDB API)
  const savePassword = async () => {
    if (!form.site || !form.username || !form.password) {
      alert("Please fill all fields");
      return;
    }

    await fetch("http://localhost:3000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({ site: "", username: "", password: "" });
    getpasswords();
  };

  // Delete Password
  const deletePassword = async (id) => {
    let confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;

    await fetch(`http://localhost:3000/${id}`, {
      method: "DELETE"
    });

    getpasswords();
  };

  // Edit Password
  const editPassword = (id) => {
    const item = passwordArray.find((p) => p._id === id);
    setForm(item);
  };

  // Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 bg-gray-100">

      <h1 className="text-4xl font-bold text-center">
        <span className="text-green-500">&lt;</span>
        <span className="text-black">Pass</span>
        <span className="text-green-700">OP/&gt;</span>
      </h1>

      <p className="text-gray-600 text-lg mb-8">Your own Password Manager</p>

      <div className="flex flex-col gap-6 w-[600px] bg-white p-6 rounded-xl shadow-md">

        <input
          name="site"
          value={form.site}
          onChange={handleChange}
          className="w-full border border-green-300 rounded-full px-5 py-2"
          type="text"
          placeholder="Enter website URL"
        />

        <div className="flex gap-4">

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border border-green-300 rounded-full px-5 py-2"
            type="text"
            placeholder="Enter Username"
          />

          <div className="relative w-full">
            <input
              ref={passRef}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-green-300 rounded-full px-5 py-2"
              type="password"
              placeholder="Enter Password"
            />

            <span className="absolute right-3 top-2 cursor-pointer" onClick={showPassword}>
              <img ref={eyeRef} className="w-6 h-6" src={eyeIcon} alt="toggle" />
            </span>
          </div>
        </div>

        <button
          onClick={savePassword}
          className="mx-auto bg-green-500 text-white px-6 py-2 rounded-full"
        >
          Save Password
        </button>

      </div>

      <div className="mt-10 w-[700px] bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Saved Passwords</h2>

        {passwordArray.length === 0 ? (
          <p>No passwords saved yet.</p>
        ) : (
          <table className="table-auto w-full border">
            <thead className="bg-green-600 text-white">
              <tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {passwordArray.map((item) => (
                <tr key={item._id} className="text-center border">

                  <td className="flex items-center gap-2 justify-center">
                    <a href={item.site} target="_blank" className="text-blue-600">
                      {item.site}
                    </a>
                    <img
                      src={copyIcon}
                      className="w-5 cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(item.site)}
                    />
                  </td>

                  <td>{item.username}</td>
                  <td>{item.password}</td>

                  <td>
                    <img
                      src={EditIcon}
                      className="w-5 cursor-pointer"
                      onClick={() => editPassword(item._id)}
                    />
                  </td>

                  <td>
                    <img
                      src={DeleteIcon}
                      className="w-5 cursor-pointer"
                      onClick={() => deletePassword(item._id)}
                    />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Manager;
