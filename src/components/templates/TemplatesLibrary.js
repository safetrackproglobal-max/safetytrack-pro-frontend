import React, { useState, useEffect } from "react";
import TemplateEditor from "./TemplateEditor";

export default function TemplatesLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  // Fetch templates on mount
  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/templates", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (!res.ok) throw new Error("Failed to load templates");
      setTemplates(await res.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleEdit(t) {
    setSelected(t);
    setShowEditor(true);
  }

  function handleNew() {
    setSelected(null);
    setShowEditor(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this template?")) return;
    setError("");
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchTemplates();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Document Templates</h2>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      <button onClick={handleNew}>+ New Template</button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul style={{ marginTop: 16 }}>
          {templates.map((t) => (
            <li key={t.id} style={{ marginBottom: 8 }}>
              <strong>{t.name}</strong> &mdash; {t.description || "No description"}
              <button onClick={() => handleEdit(t)} style={{ marginLeft: 8 }}>Edit</button>
              <button onClick={() => handleDelete(t.id)} style={{ marginLeft: 8, color: "red" }}>Delete</button>
            </li>
          ))}
          {templates.length === 0 && <li>No templates found.</li>}
        </ul>
      )}
      {showEditor && (
        <TemplateEditor
          template={selected}
          onClose={() => { setShowEditor(false); fetchTemplates(); }}
        />
      )}
    </div>
  );
}