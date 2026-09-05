import React, { useState, useEffect } from "react";

export default function AdvancedEditor() {
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("list"); // list | edit | new
  const [error, setError] = useState("");

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/editor/documents", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Failed to load documents");
      setDocs(await res.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function loadDoc(doc) {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/editor/documents/${doc.id}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Failed to load document");
      const data = await res.json();
      setSelected(data);
      setTitle(data.title);
      setContent(data.content);
      setMode("edit");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleNew() {
    setMode("new");
    setSelected(null);
    setTitle("");
    setContent("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      let res;
      if (mode === "new") {
        res = await fetch("/api/editor/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify({ title, content })
        });
      } else {
        res = await fetch(`/api/editor/documents/${selected.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify({ title, content })
        });
      }
      if (!res.ok) throw new Error("Save failed");
      setMode("list");
      fetchDocs();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this document?")) return;
    setError("");
    try {
      const res = await fetch(`/api/editor/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchDocs();
      setMode("list");
    } catch (e) {
      setError(e.message);
    }
  }

  function handleCancel() {
    setMode("list");
    setSelected(null);
  }

  return (
    <div>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {mode === "list" && (
        <div>
          <button onClick={handleNew}>+ New Document</button>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul style={{ marginTop: 16 }}>
              {docs.map((doc) => (
                <li key={doc.id} style={{ marginBottom: 8 }}>
                  <strong>{doc.title}</strong> (updated {doc.updated_at.split("T")[0]}, v{doc.version})
                  <button onClick={() => loadDoc(doc)} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(doc.id)} style={{ marginLeft: 8, color: "red" }}>Delete</button>
                </li>
              ))}
              {docs.length === 0 && <li>No documents found.</li>}
            </ul>
          )}
        </div>
      )}
      {(mode === "edit" || mode === "new") && (
        <form onSubmit={handleSave} style={{
          background: "#eee", padding: 16, border: "1px solid #ccc", marginTop: 16
        }}>
          <h3>{mode === "new" ? "New Document" : "Edit Document"}</h3>
          <div>
            <input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ width: 300, marginBottom: 8 }}
            />
          </div>
          <div>
            <textarea
              placeholder="Content"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              style={{ width: 500, height: 200, marginBottom: 8 }}
            />
          </div>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={handleCancel} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}