import React from 'react';
import { Card } from 'antd';
import LessonsLearned from '../../components/compliance/LessonsLearned';
import { useAuth } from '../../context/AuthContext';

const LessonsLearnedPage = () => {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: 24 }}>
      <LessonsLearned 
        currentUser={user}
        incidents={[]}
      />
    </div>
  );
};

export default LessonsLearnedPage;