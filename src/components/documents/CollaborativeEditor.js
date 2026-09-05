// src/components/documents/CollaborativeEditor.jsx

import React, { useState, useEffect, useRef } from 'react';
import { WebSocket } from 'ws';
import { Avatar, Badge, Tooltip, List, Tag } from 'antd';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';
import Quill from 'quill';

const CollaborativeEditor = ({ documentId, currentUser, onSave }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [cursors, setCursors] = useState({});
  const [socket, setSocket] = useState(null);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket(`ws://localhost:5000/ws/docs/${documentId}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log('Connected to collaborative session');
      ws.send(JSON.stringify({
        type: 'join',
        userId: currentUser.id,
        userName: currentUser.name,
        userColor: getRandomColor()
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleSocketMessage(data);
    };

    ws.onclose = () => {
      console.log('Disconnected from collaborative session');
    };

    // Initialize Quill editor
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      quillRef.current.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          ws.send(JSON.stringify({
            type: 'change',
            delta: delta,
            userId: currentUser.id
          }));
        }
      });
    }

    return () => {
      if (ws) ws.close();
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [documentId]);

  const handleSocketMessage = (data) => {
    switch (data.type) {
      case 'user_joined':
        setCollaborators(prev => [...prev, {
          id: data.userId,
          name: data.userName,
          color: data.userColor
        }]);
        break;
      
      case 'user_left':
        setCollaborators(prev => prev.filter(c => c.id !== data.userId));
        break;
      
      case 'cursor':
        setCursors(prev => ({
          ...prev,
          [data.userId]: {
            position: data.position,
            color: data.color,
            name: data.userName
          }
        }));
        break;
      
      case 'change':
        // Apply remote changes
        if (quillRef.current) {
          quillRef.current.updateContents(data.delta);
        }
        break;
      
      default:
        break;
    }
  };

  const getRandomColor = () => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderCollaborators = () => (
    <div style={{ 
      position: 'fixed', 
      top: 80, 
      right: 24, 
      background: 'white', 
      padding: 16, 
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      minWidth: 200,
      zIndex: 1000
    }}>
      <h4>Collaborators ({collaborators.length})</h4>
      <List
        dataSource={collaborators}
        renderItem={(user) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: user.color }}>
                  {user.name[0]}
                </Avatar>
              }
              title={user.name}
              description={
                <Badge status="success" text="Online" />
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={editorRef} 
        style={{ 
          height: 500,
          background: 'white',
          borderRadius: 8,
          padding: 16
        }}
      />
      {renderCollaborators()}
      
      {/* Cursors */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          style={{
            position: 'absolute',
            left: cursor.position.x,
            top: cursor.position.y - 10,
            color: cursor.color,
            fontSize: 12,
            pointerEvents: 'none',
            transition: 'all 0.1s ease'
          }}
        >
          <Tooltip title={cursor.name}>
            <span>|</span>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export default CollaborativeEditor;