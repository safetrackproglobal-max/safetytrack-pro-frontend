import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // adjust for your backend

export default function RealtimeCollaborativeEditor({ docId, user }) {
  const [content, setContent] = useState("");
  const [users, setUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.emit("join_document", { doc_id: docId, user });

    socketRef.current.on("user_joined", ({ user }) => {
      setUsers(prev => [...new Set([...prev, user])]);
    });
    socketRef.current.on("user_left", ({ user }) => {
      setUsers(prev => prev.filter(u => u !== user));
    });
    socketRef.current.on("document_edited", ({ content }) => {
      setContent(content);
    });

    return () => {
      socketRef.current.emit("leave_document", { doc_id: docId, user });
      socketRef.current.disconnect();
    };
  }, [docId, user]);

  function handleChange(e) {
    const newContent = e.target.value;
    setContent(newContent);
    socketRef.current.emit("edit_document", { doc_id: docId, content: newContent, user });
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <strong>Collaborators:</strong> {users.join(", ") || "Just you"}
      </div>
      <textarea
        style={{ width: 500, height: 200 }}
        value={content}
        onChange={handleChange}
      />
    </div>
  );
}