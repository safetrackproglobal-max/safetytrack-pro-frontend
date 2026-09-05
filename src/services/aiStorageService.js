// src/services/aiStorageService.js
import { apiPost, apiGet, apiDelete, apiPut } from './api';

// ============================================================
// DATABASE STORAGE (Permanent)
// ============================================================

// Save chat history to database
export const saveChatHistory = async (conversation, metadata = {}) => {
  try {
    const response = await apiPost('/ai/chat/history', {
      messages: conversation,
      metadata: {
        ...metadata,
        industry: metadata.industry || 'general',
        personality: metadata.personality || 'professional',
        timestamp: new Date().toISOString()
      }
    });
    return response;
  } catch (error) {
    console.error('Failed to save chat history:', error);
    // Fallback to localStorage
    saveChatHistoryLocal(conversation, metadata);
    return { success: false, error: error.message, fallback: true };
  }
};

// Get chat history from database
export const getChatHistory = async (limit = 50, offset = 0) => {
  try {
    const response = await apiGet('/ai/chat/history', { 
      params: { limit, offset } 
    });
    return response;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    // Fallback to localStorage
    return getChatHistoryLocal(limit);
  }
};

// Get a single chat session
export const getChatSession = async (sessionId) => {
  try {
    const response = await apiGet(`/ai/chat/session/${sessionId}`);
    return response;
  } catch (error) {
    console.error('Failed to get chat session:', error);
    return null;
  }
};

// Delete chat session
export const deleteChatSession = async (sessionId) => {
  try {
    const response = await apiDelete(`/ai/chat/session/${sessionId}`);
    return response;
  } catch (error) {
    console.error('Failed to delete chat session:', error);
    return { success: false, error: error.message };
  }
};

// Clear all chat history
export const clearChatHistory = async () => {
  try {
    const response = await apiDelete('/ai/chat/history');
    return response;
  } catch (error) {
    console.error('Failed to clear chat history:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// DOCUMENT STORAGE (Database)
// ============================================================

// Save document to database
export const saveDocument = async (document) => {
  try {
    const response = await apiPost('/ai/documents/save', {
      document: {
        ...document,
        content: document.htmlContent || document.content,
        preview: document.preview || document.content?.substring(0, 200),
        savedAt: new Date().toISOString()
      }
    });
    return response;
  } catch (error) {
    console.error('Failed to save document:', error);
    // Fallback to localStorage
    saveDocumentLocal(document);
    return { success: false, error: error.message, fallback: true };
  }
};

// Get all documents from database
export const getDocuments = async (filters = {}) => {
  try {
    const response = await apiGet('/ai/documents', { params: filters });
    return response;
  } catch (error) {
    console.error('Failed to get documents:', error);
    return getDocumentsLocal();
  }
};

// Get a single document
export const getDocument = async (documentId) => {
  try {
    const response = await apiGet(`/ai/documents/${documentId}`);
    return response;
  } catch (error) {
    console.error('Failed to get document:', error);
    return getDocumentLocal(documentId);
  }
};

// Update document
export const updateDocument = async (documentId, updates) => {
  try {
    const response = await apiPut(`/ai/documents/${documentId}`, updates);
    return response;
  } catch (error) {
    console.error('Failed to update document:', error);
    return { success: false, error: error.message };
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const response = await apiDelete(`/ai/documents/${documentId}`);
    return response;
  } catch (error) {
    console.error('Failed to delete document:', error);
    deleteDocumentLocal(documentId);
    return { success: false, error: error.message };
  }
};

// ============================================================
// LOCAL STORAGE (Fallback / Offline)
// ============================================================

const STORAGE_KEYS = {
  CHAT_HISTORY: 'ai_chat_history',
  DOCUMENTS: 'ai_documents',
  CURRENT_SESSION: 'ai_current_session',
  SAVED_RESPONSES: 'ai_saved_responses'
};

// Chat History - Local
export const saveChatHistoryLocal = (conversation, metadata = {}) => {
  try {
    const history = {
      sessionId: metadata.sessionId || `session_${Date.now()}`,
      messages: conversation,
      metadata: {
        ...metadata,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Get existing sessions
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY) || '[]');
    
    // Update or add new session
    const existingIndex = sessions.findIndex(s => s.sessionId === history.sessionId);
    if (existingIndex >= 0) {
      sessions[existingIndex] = history;
    } else {
      sessions.unshift(history);
    }
    
    // Keep only last 20 sessions
    if (sessions.length > 20) {
      sessions.length = 20;
    }
    
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(history));
    
    return { success: true, sessionId: history.sessionId };
  } catch (error) {
    console.error('Failed to save chat history locally:', error);
    return { success: false, error: error.message };
  }
};

export const getChatHistoryLocal = (limit = 50) => {
  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY) || '[]');
    return {
      success: true,
      sessions: sessions.slice(0, limit),
      total: sessions.length
    };
  } catch (error) {
    console.error('Failed to get chat history locally:', error);
    return { success: false, sessions: [], total: 0 };
  }
};

export const getCurrentSessionLocal = () => {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION) || 'null');
    return session;
  } catch (error) {
    console.error('Failed to get current session:', error);
    return null;
  }
};

// Documents - Local
export const saveDocumentLocal = (document) => {
  try {
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    const existingIndex = documents.findIndex(d => d.id === document.id);
    
    const docToSave = {
      ...document,
      savedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      documents[existingIndex] = docToSave;
    } else {
      documents.unshift(docToSave);
    }
    
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    return { success: true };
  } catch (error) {
    console.error('Failed to save document locally:', error);
    return { success: false, error: error.message };
  }
};

export const getDocumentsLocal = () => {
  try {
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    return {
      success: true,
      documents: documents,
      total: documents.length
    };
  } catch (error) {
    console.error('Failed to get documents locally:', error);
    return { success: false, documents: [], total: 0 };
  }
};

export const getDocumentLocal = (documentId) => {
  try {
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    const document = documents.find(d => d.id === documentId);
    return { success: true, document: document || null };
  } catch (error) {
    console.error('Failed to get document locally:', error);
    return { success: false, document: null };
  }
};

export const deleteDocumentLocal = (documentId) => {
  try {
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    const filtered = documents.filter(d => d.id !== documentId);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Failed to delete document locally:', error);
    return { success: false, error: error.message };
  }
};

// Saved Responses - Local
export const saveResponseLocal = (response) => {
  try {
    const responses = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_RESPONSES) || '[]');
    responses.unshift({
      ...response,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.SAVED_RESPONSES, JSON.stringify(responses));
    return { success: true };
  } catch (error) {
    console.error('Failed to save response locally:', error);
    return { success: false, error: error.message };
  }
};

export const getSavedResponsesLocal = () => {
  try {
    const responses = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_RESPONSES) || '[]');
    return { success: true, responses };
  } catch (error) {
    console.error('Failed to get saved responses:', error);
    return { success: false, responses: [] };
  }
};

// ============================================================
// SYNC UTILITY
// ============================================================

export const syncAIStorage = async () => {
  try {
    // Sync documents from local to database
    const localDocs = getDocumentsLocal();
    if (localDocs.success && localDocs.documents.length > 0) {
      for (const doc of localDocs.documents) {
        try {
          await saveDocument(doc);
        } catch (e) {
          console.warn('Failed to sync document:', doc.id, e);
        }
      }
    }
    
    // Sync chat history from local to database
    const localChat = getChatHistoryLocal();
    if (localChat.success && localChat.sessions.length > 0) {
      for (const session of localChat.sessions) {
        try {
          await saveChatHistory(session.messages, session.metadata);
        } catch (e) {
          console.warn('Failed to sync chat session:', session.sessionId, e);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to sync AI storage:', error);
    return { success: false, error: error.message };
  }
};

export default {
  saveChatHistory,
  getChatHistory,
  getChatSession,
  deleteChatSession,
  clearChatHistory,
  saveDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  saveChatHistoryLocal,
  getChatHistoryLocal,
  getCurrentSessionLocal,
  saveDocumentLocal,
  getDocumentsLocal,
  getDocumentLocal,
  deleteDocumentLocal,
  saveResponseLocal,
  getSavedResponsesLocal,
  syncAIStorage
};