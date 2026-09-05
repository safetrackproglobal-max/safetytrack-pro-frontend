import React, { useEffect, useState } from "react";

export default function ReferralDashboard() {
  const [referrals, setReferrals] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => { fetchReferrals(); }, []);

  async function fetchReferrals() {
    setLoading(true); setError(""); setInfo("");
    try {
      const res = await fetch("/api/referrals", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Failed to load referrals");
      setReferrals(await res.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ referred_email: email })
      });
      if (!res.ok) throw new Error((await res.json()).message || "Error");
      setInfo("Referral sent!");
      setEmail("");
      fetchReferrals();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this referral?")) return;
    setError(""); setInfo("");
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchReferrals();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Referral Program</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 16 }}>
        <input
          placeholder="Friend's email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: 220, marginRight: 8 }}
        />
        <button type="submit">Send Referral</button>
      </form>
      {info && <div style={{ color: "green", marginBottom: 8 }}>{info}</div>}
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      <ul>
        {referrals.map(r => (
          <li key={r.id} style={{ marginBottom: 6 }}>
            {r.referred_email} — {r.status}
            {r.reward_given && <span style={{ color: "green", marginLeft: 8 }}>[Rewarded]</span>}
            <button onClick={() => handleDelete(r.id)} style={{ marginLeft: 8 }}>Delete</button>
          </li>
        ))}
        {referrals.length === 0 && <li>No referrals yet.</li>}
      </ul>
    </div>
  );
}