// src/components/documents/useTrackChanges.js
// Custom diff-based track changes for Tiptap.

import { useState, useCallback, useRef, useEffect } from 'react';
import { diffWordsWithSpace } from 'diff';
import documentService from '../../services/documentService';

/**
 * useTrackChanges
 *
 * @param {Editor}  editor    - Tiptap editor instance
 * @param {number}  documentId
 * @param {boolean} enabled   - whether track-changes mode is active
 */
export function useTrackChanges(editor, documentId, enabled) {
  const [pendingChanges, setPendingChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [currentHunks, setCurrentHunks] = useState([]);
  const [hasUnsavedChange, setHasUnsavedChange] = useState(false);

  const baselineRef = useRef('');

  // ---- When tracking turns ON, snapshot the current content -----------
  useEffect(() => {
    if (!enabled || !editor) {
      setHasUnsavedChange(false);
      return;
    }
    const html = editor.getHTML();
    setOriginalContent(html);
    baselineRef.current = html;
    setCurrentHunks([]);
    setHasUnsavedChange(false);
  }, [enabled, editor]);

  // ---- On every edit while tracking is ON, compute hunks --------------
  useEffect(() => {
    if (!enabled || !editor) return;

    const handleUpdate = () => {
      const current = editor.getHTML();
      const hunks = computeHunks(baselineRef.current, current);
      setCurrentHunks(hunks);
      setHasUnsavedChange(
        hunks.some((h) => h.type === 'insert' || h.type === 'delete')
      );
    };

    editor.on('update', handleUpdate);
    return () => editor.off('update', handleUpdate);
  }, [enabled, editor]);

  // ---- Load pending changes from server --------------------------------
  const loadPendingChanges = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const data = await documentService.getDocumentChanges(documentId, { status: 'pending' });
      setPendingChanges(data.changes || []);
    } catch (err) {
      console.error('Failed to load changes:', err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) loadPendingChanges();
  }, [documentId, loadPendingChanges]);

  // ---- Save current hunk set as a change (when user stops tracking) ---
  const saveCurrentChange = useCallback(async () => {
    if (!documentId || !editor) return null;

    const proposed = editor.getHTML();
    const hunks = computeHunks(baselineRef.current, proposed);
    const inserts = hunks.filter((h) => h.type === 'insert').length;
    const deletes = hunks.filter((h) => h.type === 'delete').length;

    if (inserts === 0 && deletes === 0) {
      // No actual change
      return null;
    }

    const summary = `${inserts} insertion${inserts !== 1 ? 's' : ''}, ${deletes} deletion${deletes !== 1 ? 's' : ''}`;

    setLoading(true);
    try {
      const data = await documentService.createDocumentChange(documentId, {
        original_content: baselineRef.current,
        proposed_content: proposed,
        hunks,
        summary
      });
      setHasUnsavedChange(false);
      await loadPendingChanges();
      return data.change;
    } catch (err) {
      console.error('Save change failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [documentId, editor, loadPendingChanges]);

  // ---- Accept / Reject -------------------------------------------------
  const acceptChange = useCallback(async (changeId) => {
    try {
      await documentService.acceptDocumentChange(changeId);
      await loadPendingChanges();
    } catch (err) {
      console.error('Accept failed:', err);
    }
  }, [loadPendingChanges]);

  const rejectChange = useCallback(async (changeId) => {
    try {
      await documentService.rejectDocumentChange(changeId);
      await loadPendingChanges();
    } catch (err) {
      console.error('Reject failed:', err);
    }
  }, [loadPendingChanges]);

  const deleteChange = useCallback(async (changeId) => {
    try {
      await documentService.deleteDocumentChange(changeId);
      await loadPendingChanges();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [loadPendingChanges]);

  return {
    // pending list (already saved on the server)
    pendingChanges,
    // the hunks the user is producing RIGHT NOW (not yet saved)
    currentHunks,
    hasUnsavedChange,
    loading,
    originalContent,
    saveCurrentChange,
    loadPendingChanges,
    acceptChange,
    rejectChange,
    deleteChange
  };
}

// ============================================================
// HUNK COMPUTATION
// ============================================================

/**
 * Compute word-level hunks between two HTML strings.
 * We strip tags first (crude but effective for display purposes),
 * run a word diff, then re-wrap in spans for display.
 */
export function computeHunks(originalHtml, currentHtml) {
  const a = htmlToPlainText(originalHtml);
  const b = htmlToPlainText(currentHtml);

  const parts = diffWordsWithSpace(a, b);
  return parts.map((p) => ({
    type: p.added ? 'insert' : p.removed ? 'delete' : 'equal',
    value: p.value
  }));
}

/**
 * Strip HTML tags so the diff operates on visible text only.
 */
function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Build an inline HTML preview string from hunks.
 * - insert => <ins class="tc-insert">text</ins>
 * - delete => <del class="tc-delete">text</del>
 * - equal  => plain text
 */
export function hunksToInlineHtml(hunks) {
  if (!hunks || !hunks.length) return '';
  return hunks
    .map((h) => {
      const safe = escapeHtml(h.value);
      if (h.type === 'insert') return `<ins class="tc-insert">${safe}</ins>`;
      if (h.type === 'delete') return `<del class="tc-delete">${safe}</del>`;
      return safe;
    })
    .join('');
}

function escapeHtml(s) {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}