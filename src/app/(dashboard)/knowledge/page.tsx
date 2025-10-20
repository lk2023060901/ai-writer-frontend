
'use client';

import Navbar from '@/features/chat/components/Navbar';
import KnowledgePage from '@/features/knowledge/components/KnowledgePage';

const KnowledgeRoute = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <KnowledgePage />
    </div>
  );
};

export default KnowledgeRoute;
