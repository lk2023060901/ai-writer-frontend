// React 19 兼容性补丁 - 必须在最早期导入
import '@ant-design/v5-patch-for-react-19';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
