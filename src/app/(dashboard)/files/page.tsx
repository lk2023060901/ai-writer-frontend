
'use client';

import Navbar from '@/features/chat/components/Navbar';
import FilesPage from '@/features/files/components/FilesPage';

const FilesRoute = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <FilesPage />
    </div>
  );
};

export default FilesRoute;
