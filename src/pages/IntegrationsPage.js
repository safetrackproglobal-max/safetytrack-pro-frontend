import React, { useState } from "react";
export default function IntegrationsPage() {
  const [status, setStatus] = useState({});
  const connectERP = async () => {
    // OAuth flow or API key exchange, handled via backend
    const res = await fetch("/api/integrations/erp/connect", { method: "POST", headers: { Authorization: `Bearer ${localStorage.token}` } });
    setStatus(s => ({ ...s, erp: res.ok ? "Connected" : "Error" }));
  };

  return (
    <div>
      <h2>Third-Party Integrations</h2>
      <button onClick={connectERP}>Connect ERP</button> <span>{status.erp}</span>
      {/* Repeat for HR, compliance, etc. */}
    </div>
  );
}