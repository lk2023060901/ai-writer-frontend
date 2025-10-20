
'use client';

import Navbar from '@/features/chat/components/Navbar';
import AgentsPage from '@/features/agents/components/AgentsPage';

const AgentsRoute = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <AgentsPage />
    </div>
  );
};

export default AgentsRoute;
