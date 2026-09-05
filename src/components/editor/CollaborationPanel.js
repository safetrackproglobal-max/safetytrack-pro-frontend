import React, { useEffect, useState } from "react";
import { Card, List, Avatar, Input, Button, message } from "antd";
import { UserAddOutlined, SendOutlined } from "@ant-design/icons";
import axios from "axios";

export default function CollaborationPanel({ documentId, userId }) {
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [chat, setChat] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    fetchCollaborators();
    fetchChat();
    // eslint-disable-next-line
  }, [documentId]);

  const fetchCollaborators = async () => {
    try {
      const { data } = await axios.get(`/api/editor/${documentId}/collaborators`);
      setCollaborators(data);
    } catch {
      setCollaborators([]);
    }
  };

  const fetchChat = async () => {
    try {
      const { data } = await axios.get(`/api/editor/${documentId}/chat`);
      setChat(data);
    } catch {
      setChat([]);
    }
  };

  const handleInvite = async () => {
    try {
      await axios.post(`/api/editor/${documentId}/invite`, { email: inviteEmail });
      message.success("User invited");
      setInviteEmail("");
      fetchCollaborators();
    } catch {
      message.error("Failed to invite");
    }
  };

  const handleSend = async () => {
    if (!messageText) return;
    try {
      await axios.post(`/api/editor/${documentId}/chat`, { user_id: userId, message: messageText });
      setMessageText("");
      fetchChat();
    } catch {
      message.error("Failed to send message");
    }
  };

  return (
    <Card title="Collaborators & Chat" style={{ minHeight: 320 }}>
      <List
        header={<b>Collaborators</b>}
        dataSource={collaborators}
        renderItem={c => (
          <List.Item>
            <Avatar>{c.name?.[0]}</Avatar>
            {c.name} ({c.email})
          </List.Item>
        )}
      />
      <Input.Group compact style={{ marginTop: 16 }}>
        <Input
          style={{ width: 200 }}
          placeholder="Invite by email"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
        />
        <Button icon={<UserAddOutlined />} onClick={handleInvite}>
          Invite
        </Button>
      </Input.Group>
      <div style={{ marginTop: 24 }}>
        <List
          header={<b>Live Chat</b>}
          dataSource={chat}
          renderItem={m => (
            <List.Item>
              <span><Avatar>{m.user_name?.[0]}</Avatar> <b>{m.user_name}:</b> {m.message}</span>
            </List.Item>
          )}
        />
        <Input
          style={{ marginTop: 8 }}
          placeholder="Type message..."
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onPressEnter={handleSend}
          suffix={<SendOutlined onClick={handleSend} />}
        />
      </div>
    </Card>
  );
}