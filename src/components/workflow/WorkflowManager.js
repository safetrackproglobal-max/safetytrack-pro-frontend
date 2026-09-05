import React, { useState, useEffect } from "react";

export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState("");
  const [mode, setMode] = useState("list"); // list | edit | new
  const [error, setError] = useState("");

  useEffect(() => { fetchWorkflows(); }, []);

  async function fetchWorkflows() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/workflows", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Failed to load workflows");
      setWorkflows(await res.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleNew() {
    setMode("new");
    setSelected(null);
    setName("");
    setDescription("");
    setSteps([]);
    setCurrentStep("");
  }

  function handleEdit(wf) {
    setMode("edit");
    setSelected(wf);
    setName(wf.name);
    setDescription(wf.description);
    setSteps(wf.steps || []);
    setCurrentStep("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const method = mode === "new" ? "POST" : "PATCH";
    const url = mode === "new" ? "/api/workflows" : `/api/workflows/${selected.id}`;
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ name, description, steps })
      });
      if (!res.ok) throw new Error("Save failed");
      setMode("list");
      fetchWorkflows();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this workflow?")) return;
    setError("");
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchWorkflows();
      setMode("list");
    } catch (e) {
      setError(e.message);
    }
  }

  function handleAddStep() {
    if (currentStep.trim()) {
      setSteps([...steps, currentStep]);
      setCurrentStep("");
    }
  }

  function handleRemoveStep(idx) {
    setSteps(steps.filter((_, i) => i !== idx));
  }

  function handleCancel() {
    setMode("list");
    setSelected(null);
  }

  return (
    <div>
      <h2>Workflow Automation</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {mode === "list" && (
        <>
          <button onClick={handleNew}>+ New Workflow</button>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul style={{ marginTop: 16 }}>
              {workflows.map(wf => (
                <li key={wf.id} style={{ marginBottom: 8 }}>
                  <strong>{wf.name}</strong> — {wf.description}
                  <button onClick={() => handleEdit(wf)} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(wf.id)} style={{ marginLeft: 8, color: "red" }}>Delete</button>
                </li>
              ))}
              {workflows.length === 0 && <li>No workflows found.</li>}
            </ul>
          )}
        </>
      )}
      {(mode === "new" || mode === "edit") && (
        <form onSubmit={handleSave} style={{
          background: "#eee", padding: 16, border: "1px solid #ccc", marginTop: 16
        }}>
          <h3>{mode === "new" ? "New Workflow" : "Edit Workflow"}</h3>
          <div>
            <input
              placeholder="Workflow name"
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
              style={{ width: 350, marginBottom: 8 }}
            />
          </div>
          <div>
            <strong>Steps:</strong>
            <ul>
              {steps.map((step, idx) => (
                <li key={idx}>
                  {step}
                  <button type="button" onClick={() => handleRemoveStep(idx)} style={{ marginLeft: 8 }}>Remove</button>
                </li>
              ))}
            </ul>
            <input
              placeholder="Add step"
              value={currentStep}
              onChange={e => setCurrentStep(e.target.value)}
              style={{ width: 300, marginBottom: 8 }}
            />
            <button type="button" onClick={handleAddStep}>Add Step</button>
          </div>
          <button type="submit">{mode === "new" ? "Create" : "Save"}</button>
          <button type="button" onClick={handleCancel} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}