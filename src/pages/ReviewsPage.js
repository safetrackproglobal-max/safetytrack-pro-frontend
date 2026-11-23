// src/pages/ReviewsPage.js
// Focused review portal: /reviews (documents sent to me) and /reviews/:id (read, sign, approve).
// Client reviewers only ever see this portal; colleagues can come back to their dashboard.
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Drawer, Space, Typography } from 'antd';
import { LogoutOutlined, EditOutlined, AppstoreOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import SubmissionsCenter from '../components/submissions/SubmissionsCenter';
import ReviewAndSign from '../components/submissions/ReviewAndSign';
import { SigningProfile } from '../components/submissions/SigningTools';
import '../components/submissions/Submissions.css';

const { Text, Title, Paragraph } = Typography;

function ReviewsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const isClient = user?.user_type === 'client_reviewer';

  return (
    <div className="rp-shell">
      <div className="rp-top">
        <Space>
          <SafetyCertificateOutlined style={{ fontSize: 20 }} />
          <b>SafeTrack Pro · Document reviews</b>
        </Space>
        <Space wrap>
          <Text style={{ color: '#dbe7ff' }}>{user?.name}</Text>
          <Button type="text" icon={<EditOutlined />} onClick={() => setProfileOpen(true)}>My signature & stamp</Button>
          {!isClient && <Button type="text" icon={<AppstoreOutlined />} onClick={() => history.push('/dashboard')}>Back to dashboard</Button>}
          <Button type="text" icon={<LogoutOutlined />} onClick={async () => { await logout(); history.push('/login'); }}>Log out</Button>
        </Space>
      </div>

      {id ? (
        <ReviewAndSign submissionId={Number(id)} />
      ) : (
        <div className="rp-content">
          <Title level={3} style={{ marginTop: 0 }}>Documents sent to you</Title>
          <Paragraph type="secondary">
            When someone sends you a document to sign, stamp or review, it appears here and you also get an email.
            Click <b>Sign now</b>, read it, check where your signature goes, then press <b>Approve</b> or <b>Reject</b>.
            Tip: save your signature and stamp once under <b>My signature & stamp</b> so they are added for you next time.
          </Paragraph>
          <SubmissionsCenter reviewerOnly={isClient} />
        </div>
      )}

      <Drawer open={profileOpen} onClose={() => setProfileOpen(false)} width={Math.min(980, window.innerWidth)} title="My signature & stamp" destroyOnClose>
        <SigningProfile user={user} />
      </Drawer>
    </div>
  );
}

export default ReviewsPage;
