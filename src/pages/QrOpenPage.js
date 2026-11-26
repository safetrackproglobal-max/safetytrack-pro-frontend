// /d/:token — a point-of-use QR code (on a machine, notice board or controlled copy) opens the CURRENT version of the document.
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Alert, Button, Card, Spin } from 'antd';
import docControlService, { errorText } from '../services/docControlService';

const QrOpenPage = () => {
  const { token } = useParams();
  const history = useHistory();
  const [err, setErr] = useState('');
  useEffect(() => {
    let live = true;
    docControlService.resolveQr(token)
      .then((r) => { if (live) history.replace(`/document-management?tab=editor-new&doc=${Number(r.document_id)}`); })
      .catch((e) => { if (live) setErr(errorText(e, 'This code does not open a document you can see')); });
    return () => { live = false; };
  }, [token, history]);
  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 16px' }}>
      <Card>
        {err ? (
          <>
            <Alert type="warning" showIcon message={err} description="The document may have been withdrawn, or it belongs to another company." />
            <Button style={{ marginTop: 12 }} onClick={() => history.push('/document-management?tab=documents')}>Go to documents</Button>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}><Spin /> <div style={{ marginTop: 8 }}>Opening the current version…</div></div>
        )}
      </Card>
    </div>
  );
};

export default QrOpenPage;
