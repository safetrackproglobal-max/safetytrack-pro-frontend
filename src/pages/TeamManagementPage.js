import React, { useState, useEffect } from "react";

export default function TeamManagementPage() {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  useEffect(() => {
    fetch("/api/team", { headers: { Authorization: `Bearer ${localStorage.token}` } })
      .then(res => res.json()).then(setMembers);
  }, []);

  const inviteMember = async () => {
    await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.token}` },
      body: JSON.stringify({ email: inviteEmail })
    });
    setInviteEmail("");
    // reload members
  };

  return (
    <div>
      <h2>Team Management</h2>
      <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Invite by email" />
      <button onClick={inviteMember}>Invite</button>
      <ul>
        {members.map(m => (
          <li key={m.id}>{m.name} ({m.role})</li>
        ))}
      </ul>
    </div>
  );
}