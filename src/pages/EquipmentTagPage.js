// What a phone shows after scanning an equipment QR safety tag. Signed-in company users see the item and can inspect it;
// others see the status only if the company allows it, otherwise a sign-in prompt.
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Card, Result, Skeleton, Space, Typography, message } from 'antd';
import { LoginOutlined, SafetyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import equipmentService, { eqErr } from '../services/equipmentRegisterService';

const { Title, Text, Paragraph } = Typography;
const COLORS = { green: ['#f6ffed', '#52c41a', '#237804'], orange: ['#fff7e6', '#fa8c16', '#ad4e00'], red: ['#fff1f0', '#cf1322', '#a8071a'], grey: ['#fafafa', '#bfbfbf', '#595959'] };
const d = (x) => (x ? dayjs(x).format('D MMM YYYY') : '-');
const signedIn = () => { try { return !!(localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken')); } catch (e) { return false; } };

const EquipmentTagPage = () => {
  const { token } = useParams();
  const history = useHistory();
  const [s, setS] = useState({ loading: true });
  useEffect(() => {
    let live = true;
    (async () => {
      if (signedIn()) {
        try { const r = await equipmentService.scan(token); if (live) setS({ full: r.data, canManage: r.can_manage }); return; } catch (e) { /* not this company or session ended: try the public view */ }
      }
      try { const r = await equipmentService.publicStatus(token); if (live) setS({ pub: r.data }); } catch (e) {
        if (live) setS({ error: e.login ? 'login' : e.status === 404 ? 'unknown' : 'net', message: e.message });
      }
    })();
    return () => { live = false; };
  }, [token]);
  const e = s.full || s.pub;
  const inspect = async () => {
    try { const r = await equipmentService.inspect(s.full.id); history.push(`/inspections?tab=equipment&eq=${s.full.id}&open=${r.data.id}`); } catch (x) { message.error(eqErr(x)); }
  };
  const [bg, border, fg] = COLORS[e?.state_level] || COLORS.grey;
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: 16 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <SafetyOutlined style={{ fontSize: 22, color: '#1677ff' }} /><Text strong>Equipment safety tag</Text>
        </div>
        {s.loading && <Card><Skeleton active /></Card>}
        {s.error === 'login' && (
          <Result status="info" title="Sign in to see this equipment" subTitle="This company shows equipment status to its own staff only."
            extra={<Button type="primary" icon={<LoginOutlined />} onClick={() => history.push('/login')}>Sign in</Button>} />
        )}
        {s.error === 'unknown' && <Result status="warning" title="Unknown tag" subTitle="This code is not a registered equipment tag. Do not use the equipment until it is checked." />}
        {s.error === 'net' && <Result status="error" title="Could not load the tag" subTitle={s.message} extra={<Button onClick={() => window.location.reload()}>Try again</Button>} />}
        {e && (
          <Card style={{ borderRadius: 16 }}>
            <Text type="secondary">{e.tag_no} · {e.category_name}</Text>
            <Title level={3} style={{ marginTop: 4 }}>{e.name}</Title>
            <div style={{ background: bg, border: `3px solid ${border}`, borderRadius: 14, padding: '18px 16px', textAlign: 'center', margin: '12px 0' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: fg, lineHeight: 1.2 }}>{e.state_label}</div>
              {s.full?.status_reason && s.full.status !== 'in_service' && <div style={{ marginTop: 6 }}>{s.full.status_reason}</div>}
            </div>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text>Last inspected: <b>{d(e.last_inspected_on || e.last_inspected_at)}</b>{e.last_result ? ` (${e.last_result})` : ''}</Text>
              <Text>Next inspection due: <b>{d(e.next_due)}</b></Text>
              {e.cert_due && <Text>{e.cert_name || 'Certificate'}: <b>{d(e.cert_due)}</b></Text>}
              {s.full?.location && <Text>Location: {s.full.location}</Text>}
            </Space>
            {s.full && (
              <Space wrap style={{ marginTop: 16 }}>
                {s.full.status !== 'retired' && <Button type="primary" size="large" onClick={inspect}>Inspect now</Button>}
                <Button size="large" onClick={() => history.push(`/inspections?tab=equipment&eq=${s.full.id}`)}>Open in register</Button>
              </Space>
            )}
            {!s.full && <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>If anything looks damaged or unsafe, do not use it and tell your supervisor.</Paragraph>}
          </Card>
        )}
      </div>
    </div>
  );
};

export default EquipmentTagPage;
