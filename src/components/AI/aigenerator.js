import React, { useState } from "react";

export default function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true); setResult("");
    const res = await fetch("/api/ai/generate-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    setResult(data.result || data.error || "No result.");
    setLoading(false);
  }

  return (
    <div>
      <h3>AI Text Generator</h3>
      <form onSubmit={handleGenerate}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ask AI anything..."
          style={{ width: 300, marginRight: 8 }}
        />
        <button type="submit" disabled={loading}>Generate</button>
      </form>
      <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{result}</div>
    </div>
  );
}