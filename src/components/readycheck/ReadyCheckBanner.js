// Dashboard strip: start a Ready Check, and what needs a person right now (running timer, stopped work, overdue worker).
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, Button, Card, Space, Tag, Typography } from 'antd';
import { SafetyCertificateOutlined, StopOutlined } from '@ant-design/icons';
import readyCheckService from '../../services/readyCheckService';
import { musterService } from '../../services/siteSafetyService';

const { Text } = Typography;

const ReadyCheckBanner = () => {
  const history = useHistory();
  const [info, setInfo] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await readyCheckService.tasks();
      const [mine, board, muster] = await Promise.all([
        readyCheckService.mine().catch(() => null),
        data?.is_staff ? readyCheckService.board().catch(() => null) : null,
        musterService.current().catch(() => null),
      ]);
      setInfo({ staff: data?.is_staff, mine: mine?.data || [], board: board?.data || null, muster: muster?.data || null });
    } catch (e) {
      setInfo(null);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  if (!info || !Array.isArray(info.mine)) return null;
  const overdue = (info.board?.out || []).filter((r) => r.overdue);
  const stopped = info.board?.stopped || [];
  const timer = info.mine.find((r) => r.status === 'working' && r.expected_end);

  return (
    <div style={{ marginBottom: 16 }}>
      {info.muster?.event && (
        <Alert type="error" showIcon style={{ marginBottom: 8 }}
          message={info.muster.event.kind === 'real' ? 'EVACUATION: roll call running' : 'Evacuation drill: roll call running'}
          description={info.muster.my_status === 'safe' ? 'You are marked safe.' : `Go to ${info.muster.event.assembly_point || 'your assembly point'}, then press I am safe.`}
          action={<Button danger type="primary" onClick={() => history.push('/roll-call')}>{info.muster.my_status === 'safe' ? 'Open' : 'I am safe'}</Button>} />
      )}
      {overdue.length > 0 && (
        <Alert type="error" showIcon style={{ marginBottom: 8 }}
          message={`Lone worker overdue: ${overdue.map((r) => r.worker_name).join(', ')}`}
          description="Contact them now."
          action={<Button danger onClick={() => history.push('/ready-check?tab=board')}>Open board</Button>} />
      )}
      <Card size="small" style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, flex: '1 1 260px' }}>
            <Space wrap size={6}>
              <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
              <Text strong>Ready Check</Text>
              {stopped.length > 0 && <Tag color="red">{stopped.length} stopped</Tag>}
              {timer && <Tag color={timer.overdue ? 'red' : 'blue'}>{timer.overdue ? 'Your timer is overdue' : 'Your timer is running'}</Tag>}
            </Space>
            <div><Text type="secondary">One minute before the job: are the controls that keep you alive really there?</Text></div>
          </div>
          <Space wrap>
            <Button type="primary" onClick={() => history.push('/ready-check')}>{timer ? 'Open my job' : 'Start check'}</Button>
            <Button danger icon={<StopOutlined />} onClick={() => history.push('/ready-check?stop=1')}>Stop work</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ReadyCheckBanner;
