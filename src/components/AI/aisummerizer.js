import React, { useState } from "react";

export default function AISummarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSummarize(e) {
    e.preventDefault();
    setLoading(true); setSummary("");
    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setSummary(data.summary || data.error || "No result.");
    setLoading(false);
  }

  return (
    <div>
      <h3>AI Document Summarizer</h3>
      <form onSubmit={handleSummarize}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste document..."
          rows={5}
          style={{ width: 400, marginRight: 8 }}
        />
        <br />
        <button type="submit" disabled={loading}>Summarize</button>
      </form>
      <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{summary}</div>
    </div>
  );
}