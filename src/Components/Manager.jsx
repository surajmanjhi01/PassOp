import React, { useState, useRef, useEffect } from "react";
import eyeIcon from "../assets/eye.png";
import eyeCrossedIcon from "../assets/eyecross.png";
import copyIcon from "../assets/copy.png";
import EditIcon from "../assets/edit.png";
import DeleteIcon from "../assets/delete.png";

const Manager = () => {
  const eyeRef = useRef(null);
  const passRef = useRef(null);

  const [form, setForm] = useState({
    site: "",
    username: "",
    password: ""
  });

  const server_url = import.meta.env.VITE_SERVER_URL;
  const [passwordArray, setPasswordArray] = useState([]);

  const getpasswords = async () => {
    let req = await fetch(server_url);
    let passwords = await req.json();
    if (passwords) setPasswordArray(passwords);
  };

  useEffect(() => {
    getpasswords();
  }, []);

  const showPassword = () => {
    if (passRef.current.type === "password") {
      passRef.current.type = "text";
      eyeRef.current.src = eyeCrossedIcon;
    } else {
      passRef.current.type = "password";
      eyeRef.current.src = eyeIcon;
    }
  };

  const savePassword = async () => {
    if (!form.site || !form.username || !form.password) {
      alert("Fill all fields");
      return;
    }

    await fetch(server_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({ site: "", username: "", password: "" });
    getpasswords();
  };

  const deletePassword = async (id) => {
    if (!window.confirm("Delete?")) return;
    await fetch(`${server_url}${id}`, { method: "DELETE" });
    getpasswords();
  };

  const editPassword = (id) => {
    const item = passwordArray.find((p) => p._id === id);
    setForm(item);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4 bg-gray-100">

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-center">
        <span className="text-green-500">&lt;</span>
        Pass
        <span className="text-green-700">OP/&gt;</span>
      </h1>
      <p className="text-gray-600 text-sm sm:text-lg mb-6 text-center">
        Your own Password Manager
      </p>

      {/* Form Box */}
      <div className="flex flex-col gap-5 w-full max-w-xl bg-white p-5 sm:p-6 rounded-xl shadow-md">

        <input
          name="site"
          value={form.site}
          onChange={handleChange}
          className="w-full border rounded-full px-4 py-2"
          placeholder="Website URL"
        />

        <div className="flex flex-col sm:flex-row gap-4">

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded-full px-4 py-2"
            placeholder="Username"
          />

          <div className="relative w-full">
            <input
              ref={passRef}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-full px-4 py-2"
              type="password"
              placeholder="Password"
            />
            <span className="absolute right-3 top-2 cursor-pointer" onClick={showPassword}>
              <img ref={eyeRef} className="w-5 h-5" src={eyeIcon} alt="" />
            </span>
          </div>

        </div>

        <button
          onClick={savePassword}
          className="mx-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
        >
          Save Password
        </button>
      </div>

      {/* Table Section */}
      <div className="mt-8 w-full max-w-3xl bg-white p-4 sm:p-6 rounded-xl shadow-md overflow-x-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Saved Passwords</h2>

        {passwordArray.length === 0 ? (
          <p>No passwords saved.</p>
        ) : (
          <table className="w-full text-sm sm:text-base border">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-2">Website</th>
                <th className="p-2">Username</th>
                <th className="p-2">Password</th>
                <th className="p-2">Edit</th>
                <th className="p-2">Delete</th>
              </tr>
            </thead>

            <tbody>
              {passwordArray.map((item) => (
                <tr key={item._id} className="text-center border">

                  <td className="flex flex-wrap items-center justify-center gap-2 p-2">
                    <a href={item.site} target="_blank" className="text-blue-600 break-all">
                      {item.site}
                    </a>
                    <img
                      src={copyIcon}
                      className="w-4 cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(item.site)}
                    />
                  </td>

                  <td className="p-2 break-all">{item.username}</td>
                  <td className="p-2 break-all">{item.password}</td>

                  <td className="p-2">
                    <img
                      src={EditIcon}
                      className="w-4 cursor-pointer mx-auto"
                      onClick={() => editPassword(item._id)}
                    />
                  </td>

                  <td className="p-2">
                    <img
                      src={DeleteIcon}
                      className="w-4 cursor-pointer mx-auto"
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
