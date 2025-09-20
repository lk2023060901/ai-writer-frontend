import React from 'react';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppSelector } from '@/hooks/redux';
import AppLayout from '@/components/layout/AppLayout';
import ThemeProvider from '@/components/common/ThemeProvider';

// 主题配置组件
const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode } = useAppSelector(state => state.ui);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        components: {
          Layout: {
            bodyBg: 'transparent',
            headerBg: 'transparent',
            siderBg: 'transparent',
            headerHeight: 48,
          },
          Button: {
            borderRadius: 6,
          },
          Input: {
            borderRadius: 6,
          },
          Card: {
            borderRadius: 8,
          },
        },
      }}
    >
      <AntApp>
        {children}
      </AntApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppConfigProvider>
          <ThemeProvider>
            <AppLayout />
          </ThemeProvider>
        </AppConfigProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
