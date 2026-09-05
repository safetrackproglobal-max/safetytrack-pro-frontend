import React, { useState } from "react";

export default function TemplateEditor({ template, onClose }) {
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [content, setContent] = useState(template?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const method = template ? "PATCH" : "POST";
      const url = template ? `/api/templates/${template.id}` : "/api/templates";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ name, description, content }),
      });
      if (!res.ok) throw new Error("Save failed");
      onClose();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  return (
    <div style={{
      background: "#eee", padding: 16, border: "1px solid #ccc", marginTop: 16
    }}>
      <h3>{template ? "Edit Template" : "New Template"}</h3>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="Template name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: 250, marginBottom: 8 }}
          />
        </div>
        <div>
          <input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: 300, marginBottom: 8 }}
          />
        </div>
        <div>
          <textarea
            placeholder="Template content (markdown, variables supported)"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            style={{ width: 400, height: 120, marginBottom: 8 }}
          />
        </div>
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>
          Cancel
        </button>
      </form>
    </div>
  );
}