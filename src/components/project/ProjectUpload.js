import React, { useEffect, useState } from "react";

export default function ProjectUploader() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Failed to load projects");
      setProjects(await res.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setError(""); setInfo("");
    if (!name || !file) {
      setError("Name and file are required.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      setInfo("Project uploaded!");
      setName(""); setDescription(""); setFile(null);
      fetchProjects();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  function downloadFile(projectId) {
    window.open(`/api/projects/${projectId}/download`, "_blank");
  }

  return (
    <div>
      <h2>Project Upload</h2>
      <form onSubmit={handleUpload} style={{ marginBottom: 16 }}>
        <input
          placeholder="Project name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: 180, marginRight: 8 }}
          required
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: 250, marginRight: 8 }}
        />
        <input
          type="file"
          onChange={handleFileChange}
          required
          style={{ marginRight: 8 }}
        />
        <button type="submit" disabled={loading}>Upload</button>
      </form>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {info && <div style={{ color: "green", marginBottom: 8 }}>{info}</div>}
      <ul>
        {projects.map(p => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <strong>{p.name}</strong> — {p.description}
            <button onClick={() => downloadFile(p.id)} style={{ marginLeft: 8 }}>
              Download
            </button>
          </li>
        ))}
        {projects.length === 0 && <li>No projects uploaded yet.</li>}
      </ul>
    </div>
  );
}