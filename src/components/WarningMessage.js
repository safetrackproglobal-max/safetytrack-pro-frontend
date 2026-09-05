import React from "react";
export default function WarningMessage({ children }) {
  return (
    <div className="warning-message" style={{
      background: "#fff8e1", color: "#e67e22", padding: "1rem",
      borderRadius: "6px", border: "1px solid #f39c12", margin: "1rem 0"
    }}>
      <i className="fas fa-exclamation-triangle" style={{ marginRight: "0.5rem" }} />
      {children}
    </div>
  );
}