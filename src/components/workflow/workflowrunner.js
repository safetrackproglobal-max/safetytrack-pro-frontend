import React, { useState } from "react";

export default function WorkflowRunner({ workflowId }) {
  const [input, setInput] = useState("{}");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun(e) {
    e.preventDefault();
    setLoading(true); setError(""); setResults(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: input
      });
      const data = await res.json();
      if (!data.success) throw new Error("Run failed");
      setResults(data.results);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div>
      <h3>Run Workflow (AI-powered)</h3>
      <form onSubmit={handleRun}>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} style={{ width: 350 }} />
        <br />
        <button type="submit" disabled={loading}>{loading ? "Running..." : "Run"}</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {results && (
        <div style={{ marginTop: 16 }}>
          <b>Results:</b>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}