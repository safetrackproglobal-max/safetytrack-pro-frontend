// The signed-in user's assigned training and certificates with renewal status (profile + dashboards).
import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Empty, Space, Alert, Tooltip } from 'antd';
import { ReadOutlined, SafetyCertificateOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dashboardService from '../../services/dashboardService';

const { Text } = Typography;
const STATE = {
  expired: { color: 'red', label: 'Expired' },
  expiring: { color: 'orange', label: 'Renew soon' },
  valid: { color: 'green', label: 'Valid' },
  none: { color: 'default', label: 'No expiry' },
};

const MyTraining = () => {
  const [data, setData] = useState({ assigned: [], certificates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    dashboardService.getMyTraining()
      .then((res) => { if (alive) setData(res?.data || { assigned: [], certificates: [] }); })
      .catch(() => { if (alive) setError('Could not load your training'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const overdue = data.assigned.filter((a) => a.overdue).length;
  const expiring = data.certificates.filter((c) => c.state === 'expiring' || c.state === 'expired').length;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {error && <Alert type="error" showIcon message={error} />}
      {(overdue > 0 || expiring > 0) && (
        <Alert type="warning" showIcon icon={<WarningOutlined />}
               message={[overdue && `${overdue} assigned course${overdue > 1 ? 's are' : ' is'} overdue`,
                 expiring && `${expiring} certificate${expiring > 1 ? 's need' : ' needs'} renewal`].filter(Boolean).join(' · ')}
               description="Talk to your safety officer to book the session." />
      )}
      <Card size="small" title={<Space><ReadOutlined /> Assigned training</Space>}>
        <Table size="small" rowKey="id" loading={loading} dataSource={data.assigned} pagination={{ pageSize: 8, hideOnSinglePage: true }}
               scroll={{ x: 'max-content' }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No training assigned to you" /> }}
               columns={[
                 { title: 'Course', dataIndex: 'title', render: (t, r) => <span>{t}{r.category && <Text type="secondary"> · {r.category}</Text>}</span> },
                 { title: 'Due', dataIndex: 'due_date', render: (d, r) => (d ? <Text type={r.overdue ? 'danger' : undefined}>{d}</Text> : '—') },
                 { title: 'Status', dataIndex: 'status', render: (s, r) => (r.overdue ? <Tag color="red">Overdue</Tag>
                   : ['completed', 'passed'].includes(String(s).toLowerCase()) ? <Tag color="green" icon={<CheckCircleOutlined />}>Completed</Tag>
                     : <Tag>{s}</Tag>) },
                 { title: 'Completed', dataIndex: 'completion_date', render: (d) => d || '—' },
                 { title: 'Score', dataIndex: 'score', render: (s) => (s === null || s === undefined ? '—' : `${s}%`) },
               ]} />
      </Card>
      <Card size="small" title={<Space><SafetyCertificateOutlined /> Certificates & renewals</Space>}>
        <Table size="small" rowKey="id" loading={loading} dataSource={data.certificates} pagination={{ pageSize: 8, hideOnSinglePage: true }}
               scroll={{ x: 'max-content' }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No completed training yet" /> }}
               columns={[
                 { title: 'Training', dataIndex: 'title' },
                 { title: 'Completed', dataIndex: 'completed', render: (d) => d || '—' },
                 { title: 'Renew by', dataIndex: 'renew_by', render: (d, r) => (d
                   ? <Tooltip title={r.days_left < 0 ? `${-r.days_left} days ago` : `in ${r.days_left} days`}><span>{d}</span></Tooltip> : '—') },
                 { title: 'State', dataIndex: 'state', render: (s) => <Tag color={STATE[s]?.color}>{STATE[s]?.label || s}</Tag> },
               ]} />
      </Card>
    </Space>
  );
};

export default MyTraining;
