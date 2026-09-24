// src/components/documents/editor/PDFFormPanel.jsx
// Detects AcroForm fields and renders them as inputs over the PDF

import React, { useEffect, useState, useCallback } from 'react';
import { Input, Checkbox, Select, Button, Space, Divider, message, Empty, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import documentService from '../../services/documentService';

const PDFFormPanel = ({
  documentId,
  pageNumber,
  fieldPositions = [],   // [{ name, page, x, y, w, h, type }]
  onSave,                // callback(blob) if you want client-side PDF writing
  onBackendSave          // callback() after backend fill succeeds
}) => {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  // Load fields from backend on mount
  const loadFields = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const data = await documentService.getPdfFormFields(documentId);
      setFields(data.fields || []);
      const initial = {};
      (data.fields || []).forEach((f) => { initial[f.name] = f.value || ''; });
      setValues(initial);
    } catch (err) {
      console.error('Failed to load fields:', err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => { loadFields(); }, [loadFields]);

  // Save — sends values to backend, backend fills + saves new version
  const handleSave = async () => {
    if (!documentId) return;
    setSaving(true);
    try {
      const res = await documentService.fillPdfForm(documentId, values, false);
      if (res?.success) {
        message.success('Form saved as new version');
        onBackendSave?.(res);
      } else {
        message.error(res?.error || 'Save failed');
      }
    } catch (err) {
      message.error(err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // RENDER: overlay inputs positioned on the PDF page
  // ------------------------------------------------------------
  const renderOverlayInputs = () => {
    const pageFieldPositions = fieldPositions.filter(
      (fp) => fp.page === pageNumber
    );
    if (!pageFieldPositions.length) return null;

    return pageFieldPositions.map((fp) => (
      <div
        key={fp.name}
        className="pdf-field-overlay"
        style={{
          position: 'absolute',
          left: fp.x,
          top: fp.y,
          width: fp.w,
          height: fp.h,
          background: 'rgba(24, 144, 255, 0.08)',
          border: '1px dashed #1890ff',
          borderRadius: 3,
          zIndex: 10
        }}
      >
        <Input
          size="small"
          value={values[fp.name] || ''}
          onChange={(e) => setValues({ ...values, [fp.name]: e.target.value })}
          style={{ width: '100%', height: '100%', fontSize: 11 }}
          variant="borderless"
        />
      </div>
    ));
  };

  // ------------------------------------------------------------
  // RENDER: side panel listing all fields
  // ------------------------------------------------------------
  return (
    <div className="pdf-form-panel-inner">
      <div className="pdf-form-panel-header">
        <strong>Form Fields ({fields.length})</strong>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : fields.length === 0 ? (
        <Empty description="No form fields detected" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <>
          <div className="pdf-form-fields">
            {fields.map((f) => (
              <div key={f.name} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: '#595959', display: 'block' }}>
                  {f.name}
                </label>
                {f.type === '/Btn' ? (
                  <Checkbox
                    checked={!!values[f.name]}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.checked })
                    }
                  >
                    {f.name}
                  </Checkbox>
                ) : f.type === '/Ch' && Array.isArray(f.options) && f.options.length ? (
                  <Select
                    size="small"
                    value={values[f.name] || undefined}
                    onChange={(v) => setValues({ ...values, [f.name]: v })}
                    style={{ width: '100%' }}
                    options={f.options.map((o) => ({ label: String(o), value: String(o) }))}
                  />
                ) : (
                  <Input
                    size="small"
                    value={values[f.name] || ''}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <Button
            type="primary"
            block
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            Save Form Values
          </Button>
        </>
      )}
    </div>
  );
};

export default PDFFormPanel;