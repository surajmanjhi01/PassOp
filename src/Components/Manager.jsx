import React, { useState, useRef, useEffect } from "react";
import eyeIcon from "../assets/eye.png";
import eyeCrossedIcon from "../assets/eyecross.png";
import copyIcon from "../assets/copy.png";
import EditIcon from "../assets/edit.png";
import DeleteIcon from "../assets/delete.png";

const Manager = ({ token, user, onLogout }) => {
  const eyeRef = useRef(null);
  const passRef = useRef(null);
  const siteRef = useRef(null);
  const usernameRef = useRef(null);

  const [form, setForm] = useState({
    _id: "",
    site: "",
    username: "",
    password: ""
  });

  const rawServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const server_url = rawServerUrl.replace(/\/$/, "");
  const [passwordArray, setPasswordArray] = useState([]);
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const handleUnauthorized = () => {
    alert("Session expired. Please login again.");
    onLogout();
  };

  const getpasswords = async () => {
    try {
      let req = await fetch(`${server_url}/get-passwords`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (req.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!req.ok) throw new Error("Failed to fetch passwords");
      let passwords = await req.json();
      if (Array.isArray(passwords)) setPasswordArray(passwords);
    } catch (error) {
      console.error("Could not load passwords:", error);
    }
  };

  useEffect(() => {
    if (token) {
      getpasswords();
    }
  }, [token]);

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
    // Browser autofill can bypass React state updates, so read current input values too.
    const payload = {
      site: (form.site || siteRef.current?.value || "").trim(),
      username: (form.username || usernameRef.current?.value || "").trim(),
      password: (form.password || passRef.current?.value || "").trim()
    };

    if (!payload.site || !payload.username || !payload.password) {
      alert("Fill all fields");
      return;
    }

    const method = form._id ? "PUT" : "POST";
    const endpoint = form._id ? `/update-password/${form._id}` : "/save-password";

    const response = await fetch(`${server_url}${endpoint}`, {
      method,
      headers: authHeaders,
      body: JSON.stringify(payload)
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!response.ok) {
      alert("Could not save password. Check backend server and database connection.");
      return;
    }

    setForm({ _id: "", site: "", username: "", password: "" });
    getpasswords();
  };

  const deletePassword = async (id) => {
    if (!window.confirm("Delete?")) return;
    const response = await fetch(`${server_url}/delete-password/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      handleUnauthorized();
      return;
    }

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
    <div className="space-y-6">
      <section className="rounded-3xl border border-lime-200 bg-white/95 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)] sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Password Vault
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Signed in as <span className="font-semibold text-lime-700">{user?.email}</span>
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-5">

        <input
          ref={siteRef}
          name="site"
          value={form.site}
          onChange={handleChange}
          className="w-full border rounded-full px-4 py-2"
          placeholder="Website URL"
        />

        <div className="flex flex-col sm:flex-row gap-4">

          <input
            ref={usernameRef}
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
          className="mx-auto rounded-xl bg-lime-600 px-8 py-3 font-semibold text-white transition hover:bg-lime-700"
        >
          {form._id ? "Update Password" : "Save Password"}
        </button>
      </div>
      </section>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-3xl border border-lime-200 bg-white/95 p-4 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] sm:p-6">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">Your Saved Passwords</h2>

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
                  <td className="p-2 break-all font-mono">{item.password}</td>

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
