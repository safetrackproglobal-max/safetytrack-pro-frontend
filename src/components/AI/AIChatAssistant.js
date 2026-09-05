import React, { useState, useRef, useEffect } from 'react';
import { medicalAIService } from '../../services/medicalAIService';
import './ai.css';

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Medical AI assistant. How can I help you with medical questions, symptom analysis, or hospital management today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to safely extract text from response object
  const extractResponseText = (response) => {
    if (!response) return "I'm here to help. How can I assist you?";
    
    if (typeof response === 'string') return response;
    if (response.message) return response.message;
    if (response.response) return response.response;
    if (response.text) return response.text;
    if (response.content) return response.content;
    
    console.warn('Unexpected response format:', response);
    return "I've processed your request. How else can I help you?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({ 
        content: msg.text, 
        role: msg.sender === 'user' ? 'user' : 'assistant' 
      }));
      
      conversationHistory.push({ content: inputMessage, role: 'user' });
      
      // Call the medical AI service
      const response = await medicalAIService.chatWithAI(conversationHistory, {
        conversationType: 'medical_chat',
        userContext: 'medical_professional'
      });
      
      const responseText = extractResponseText(response);
      const confidence = response.confidence || response.confidence_score || null;
      
      let suggestions = response.suggestions || [
        "Analyze symptoms",
        "Check hospital departments", 
        "Get AI models status"
      ];
      
      if (!Array.isArray(suggestions)) {
        suggestions = typeof suggestions === 'string' ? [suggestions] : [];
      }
      
      const sources = response.sources || response.references || null;
      
      const aiMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: suggestions.slice(0, 3),
        confidence: confidence,
        sources: sources
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      let errorText = "I'm sorry, I'm having trouble connecting to the medical AI service. Please try again in a moment.";
      
      if (error.response?.data?.error) {
        errorText = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorText = error.response.data.message;
      } else if (error.message) {
        errorText = error.message;
      }
      
      if (error.response?.status === 403 && error.response?.data?.code === 'FEATURE_NOT_AVAILABLE') {
        errorText = "Medical AI services are not available in your current plan. Please upgrade to Pro or Enterprise to access this feature.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const quickSuggestions = [
    "Can you analyze my symptoms?",
    "What are the available hospital departments?",
    "Show me AI medical services",
    "Help with lab results interpretation",
    "Get comprehensive health analysis"
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatConfidence = (confidence) => {
    if (!confidence) return null;
    if (typeof confidence === 'number') {
      return Math.round(confidence * 100);
    }
    if (typeof confidence === 'string') {
      return confidence;
    }
    return null;
  };

  return (
    <div className="ai-chat-assistant">
      <div className="chat-header">
        <div className="ai-avatar">
          <span className="avatar-icon">🏥</span>
        </div>
        <div className="chat-info">
          <h3>Medical AI Assistant</h3>
          <p>Always available to help with medical questions and hospital management</p>
        </div>
        <div className="chat-status">
          <span className={`status-indicator ${isLoading ? 'loading' : 'online'}`}>
            {isLoading ? 'Analyzing...' : 'Online'}
          </span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
              
              {message.sender === 'ai' && message.confidence && !message.isError && (
                <div className="message-meta">
                  <span className="confidence">
                    Confidence: {formatConfidence(message.confidence)}%
                  </span>
                  {message.sources && message.sources.length > 0 && (
                    <span className="sources">
                      Sources: {Array.isArray(message.sources) ? message.sources.join(', ') : message.sources}
                    </span>
                  )}
                </div>
              )}
              
              {message.suggestions && message.sender === 'ai' && !message.isError && (
                <div className="suggestions">
                  <p>Quick actions:</p>
                  <div className="suggestion-buttons">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="btn-secondary btn-sm"
                        onClick={() => handleQuickSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span>🩺 Analyzing your medical query</span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      <div className="quick-suggestions">
        <p>Try asking about:</p>
        <div className="suggestion-chips">
          {quickSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-chip"
              onClick={() => handleQuickSuggestion(suggestion)}
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your medical question, symptoms, or hospital management query..."
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="send-button"
        >
          {isLoading ? '⏳' : '💬'}
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistant;